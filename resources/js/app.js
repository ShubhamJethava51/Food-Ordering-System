import axios from "axios";
import moment from "moment";
import Noty from "noty";
import { initAdmin } from "./admin";

let addToBag = document.querySelectorAll(".add-to-bag");
let inBagAdd = document.querySelectorAll(".inBagAddBTN");
let inBagRemove = document.querySelectorAll(".inBagRemoveBTN");
let itemCounter = document.querySelector("#bagItemsCount");
let totalAmount = document.querySelector(".amount");
const alertMsg = document.querySelector("#success-alert");

if (alertMsg) {
  setTimeout(() => {
    alertMsg.remove();
  }, 3000);
}

function updateBag(item) {
  axios
    .post("/update-bag", item)
    .then((res) => {
      itemCounter.innerText = res.data.totalQty;
      new Noty({
        type: "success",
        timeout: 1500,
        text: "Item added to bag",
      }).show();
    })
    .catch((err) => {
      console.log(err);
      new Noty({
        type: "error",
        timeout: 1500,
        text: "Something went wrong!!",
      }).show();
    });
  //'item'  is sent along with request then it can be found at 'req.body'
}

//this is functions for buttons inside the bag
function AddFromBag(item) {
  axios
    .post("/update-item-rows-add", item)
    .then((res) => {
      let itemRow = document.getElementsByClassName(item._id);
      itemRow[0].innerText = res.data.itemQty;
      itemRow[1].innerText = `₹${res.data.itemTotalPrice}`;
      itemCounter.innerText = res.data.totalQty;
      totalAmount.innerText = `₹${res.data.totalPrice}`;
      new Noty({
        type: "success",
        timeout: 500,
        text: "Item added to bag",
        progressBar: false,
      }).show();
    })
    .catch((err) => {
      console.log(err);
      new Noty({
        type: "error",
        timeout: 500,
        text: "Something went wrong!!",
        progressBar: false,
      }).show();
    });
  //'item'  is sent along with request then it can be found at 'req.body'
}

function RemoveFromBag(item) {
  axios
    .post("/update-item-rows-remove", item)
    .then((res) => {
      let itemRow = document.getElementsByClassName(item._id);
      if (!res.data.itemQty && !res.data.itemTotalPrice) {
        itemRow[0].innerText = 0;
        itemRow[1].innerText = "₹0";
        itemCounter.innerText = res.data.totalQty;
        totalAmount.innerText = `₹${res.data.totalPrice}`;
      } else {
        itemRow[0].innerText = res.data.itemQty;
        itemRow[1].innerText = `₹${res.data.itemTotalPrice}`;
        itemCounter.innerText = res.data.totalQty;
        totalAmount.innerText = `₹${res.data.totalPrice}`;
      }
      new Noty({
        type: "success",
        timeout: 500,
        text: "Item removed from bag",
        progressBar: false,
      }).show();
    })
    .catch((err) => {
      console.log(err);
      new Noty({
        type: "error",
        timeout: 500,
        text: "Something went wrong!!",
        progressBar: false,
      }).show();
    });
  //'item'  is sent along with request then it can be found at 'req.body'
}

addToBag.forEach((btn) => {
  btn.addEventListener("click", () => {
    let item = JSON.parse(btn.dataset.item);
    updateBag(item);
  });
});

inBagRemove.forEach((btn) => {
  btn.addEventListener("click", () => {
    let item = JSON.parse(btn.dataset.item);
    RemoveFromBag(item);
  });
});

inBagAdd.forEach((btn) => {
  btn.addEventListener("click", () => {
    let item = JSON.parse(btn.dataset.item);
    AddFromBag(item);
  });
});

//change order status in singleOrder

//getting order from page singleOrder

let hiddenInputOrder = document.querySelector("#hiddenInputOrder");
let order = hiddenInputOrder ? hiddenInputOrder.value : null;
order = JSON.parse(order);
let time = document.createElement("small");

let statuses = document.querySelectorAll(".status-line");

function updateStatus(order) {
  statuses.forEach((status) => {
    status.classList.remove("step-completed");
    status.classList.remove("current");
  });
  let stepCompleted = true; //it'll be true till one status got matched up with order's status
  statuses.forEach((status) => {
    let dataState = status.dataset.status;
    if (stepCompleted) {
      status.classList.add("step-completed");
    }

    if (dataState === order.status) {
      stepCompleted = false;
      time.innerText = moment(order.updatedAt).format("hh:mm A");
      status.appendChild(time);

      if (status.nextElementSibling) {
        status.nextElementSibling.classList.add("current");
      }
    }
  });
}

updateStatus(order);

//socket
let socket = io();

//now join a room for a given orderID
if (order) {
  socket.emit("join", `order_${order._id}`); //order_241jsakfjah41aush1asda <= roomId
}

let adminAreaPath = window.location.pathname;
if (adminAreaPath.includes("admin")) {
  initAdmin(socket);
  socket.emit("join", "adminRoom"); // joining to adminroom
}

socket.on("orderUpdated", (data) => {
  const updatedOrder = { ...order };
  updatedOrder.updatedAt = moment().format();
  updatedOrder.status = data.status;
  updateStatus(updatedOrder);
  new Noty({
    type: "success",
    timeout: 1500,
    text: "Order Updated",
  }).show();
});
