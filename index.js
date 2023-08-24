require("dotenv").config();
const express = require("express");
const path = require("path");
const ejs = require("ejs");
const expresssLayout = require("express-ejs-layouts");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("express-flash"); //one request flash messages (authantication validation)
const MongoDbStore = require("connect-mongo"); //it's for storing sessions (and cookie inside it)
const passport = require("passport");
const Emitter = require("events"); //when an event occur we can create and listen to it with this

const app = express();
const PORT = process.env.PORT || 3000;

//giving access to the public folder and setting up assets

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(flash());

//Database Connection
const url =
  "mongodb+srv://Shubham:Kabir2022@cluster0.wwhvy2r.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(url);
const connection = mongoose.connection;
connection
  .once("open", () => {
    console.log("Database Connected...");
  })
  .on("error", (err) => {
    console.log(`Connection Failed... cause of ${err}`);
  });

//Event emitter
const eventEmitter = new Emitter();

//we have to use same instance for making it work
app.set("eventEmitter", eventEmitter);

//session store

let mongoStore = MongoDbStore.create({
  mongoUrl: process.env.MONGO_URI,
  collection: "sessions",
});

// session configuration

app.use(
  session({
    secret: process.env.COOKIE_KEY,
    resave: false,
    store: mongoStore,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, //24 hours
  }),
);

//passport configuration in server file(for login purpose)
//because its configuration of passport, it is in 'app/config' folder
const passportInit = require("./app/config/passport");
passportInit(passport);

app.use(passport.initialize());
app.use(passport.session());

//global middleware
app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.user = req.user;
  next();
});

//view engine setup and layout folder set

app.use(expresssLayout);

//set template engine

app.set("views", path.join(__dirname, "/resources/views"));
app.set("view engine", "ejs");

//routing

require("./routes/web")(app);

const server = app.listen(PORT, () => {
  console.log(`Server listening to port ${PORT}...`);
});

//Socket

const io = require("socket.io")(server);
io.on("connection", (socket) => {
  //it'll create a socket
  //Join

  // now it'll create a room from a given orderId
  socket.on("join", (roomId) => {
    socket.join(roomId);
  });
});

eventEmitter.on("orderUpdated", (data) => {
  io.to(`order_${data.id}`).emit("orderUpdated", data); //again it will emit that event and we have to listen it in app()
});

eventEmitter.on("orderPlaced", (data) => {
  io.to("adminRoom").emit("orderPlaced", data);
});
