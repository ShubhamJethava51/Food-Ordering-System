const Order = require("../../../models/order");
const moment = require("moment");

function orderConroller() {
  return {
    orderStore(req, res) {
      //validate request
      const { phone, address } = req.body;

      if (!phone || !address) {
        req.flash("error", "All fields are required");
        return res.redirect("/bag");
      }

      const order = new Order({
        customerID: req.user._id,
        items: req.session.bag.items,
        phone,
        address,
      });

      order
        .save()
        .then((result) => {
          Order.populate(result, { path: "customerId" }, (err, placedOrder) => {
            req.flash("success", "Order placed successfully");
            delete req.session.bag;
            //Emit
            const eventEmitter = req.app.get("eventEmitter");
            eventEmitter.emit("orderPlaced", result);
            return res.redirect("/customer/orders");
          });
        })
        .catch((err) => {
          req.flash("error", "Something went wrong");
          return res.redirect("/bag");
        });
    },

    //show all orders
    async index(req, res) {
      const orders = await Order.find({ customerID: req.user._id }, null, {
        sort: { createdAt: -1 },
      });
      res.header(
        "Cache-Control",
        "no-cache, private, no-store, must-revalidate, max-scale=0, post-check=0, pre-check=0"
      );
      res.render("customers/orders", { orders: orders, moment: moment });
    },

    // show a single order status

    async show(req, res) {
      const order = await Order.findById(req.params.id);
      //autherizing user if it is the registered user's order or not
      if (req.user._id.toString() === order.customerID.toString()) {
        return res.render("customers/singleOrder", { order });
      }
      return res.redirect("/");
    },
  };
}

module.exports = orderConroller;
