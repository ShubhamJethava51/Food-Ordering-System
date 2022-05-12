const order = require("../../../models/order");

function statusController() {
  return {
    update(req, res) {
      order.updateOne(
        { _id: req.body.orderID }, //we will get this from that 'hiddenField' and selection field of admin order page
        { status: req.body.status },
        (err, data) => {
          if (err) {
            console.log(err);
            return res.redirect("/admin/orders");
          }

          // when order status got updated we have to send a message to room and it'll be received to client
          //for this we have to emit a event whenever order status got updated

          // Emit event
          const eventEmitter = req.app.get("eventEmitter");
          eventEmitter.emit("orderUpdated", {
            id: req.body.orderID,
            status: req.body.status,
          });
          return res.redirect("/admin/orders");
        }
      );
    },
  };
}

module.exports = statusController;
