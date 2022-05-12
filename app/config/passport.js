const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/user");
const bcrypt = require("bcrypt");
const user = require("../models/user");

function init(passport) {
  //we used passport here so we can use passport module's all methods here
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        const user = await User.findOne({ email: email });

        if (!user) {
          return done(null, false, {
            message: "No user found with given E-mail",
          });
        }

        bcrypt
          .compare(password, user.password)
          .then((match) => {
            if (match) {
              return done(null, user, { message: "Logged In succesfully" });
            }
            return done(null, false, { message: "Wrong username or password" });
          })
          .catch((err) => {
            return done(null, false, { message: "Something went wrong" });
          });
      }
    )
  );
  //so below portion is for getting data of user who has logged in. (just by 'req.user')
  //now will set something in session to know if user is logged in,
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  //it'll deserialize(get all data from database about user by 'id') data for given 'id'
  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });
}

module.exports = init;
