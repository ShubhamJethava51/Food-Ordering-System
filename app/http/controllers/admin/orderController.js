const Order = require("../../../models/order");

function orderController() {
  return {
    index(req, res) {
      Order.find({ status: { $ne: "completed" } }, null, {
        sort: { createdAt: -1 },
      })
        .populate("customerID", "-password") //it will get customer data by the Id (without password),
        //after successfully receiving the customer, .exec() (execute) will run
        .exec((err, orders) => {
          if (req.xhr) {
            //while there are any axios request (or ajax)
            return res.json(orders);
          } else {
            return res.render("admin/orders"); //render perticular page
          }
        });
    },
  };
}

module.exports = orderController;
