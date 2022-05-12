function bagController() {
  return {
    index(req, res) {
      res.render("customers/bag");
    },

    update(req, res) {
      //
      //checking if bag is here or not, if its first time then making basic bag structure
      //

      // bag structure is like
      /*  req.session.bag = {
          items: {
            //here are all the items
            
            itemID: {
              item: {that order's full info},
              qty: quantity of item,
            }
            itemID: {
              item: {that order's full info},
              qty: quantity of item,
            }
          }
          totalQty: total quantity in bag,
          totalPrice: total price of bag
        }*/

      if (!req.session.bag) {
        req.session.bag = {
          items: {},
          totalQty: 0,
          totalPrice: 0,
        };
      }

      let bag = req.session.bag;

      //checking if item already exist in bag or not
      if (!bag.items[req.body._id]) {
        bag.items[req.body._id] = {
          item: req.body,
          qty: 1,
        };
        bag.totalQty = bag.totalQty + 1;
        bag.totalPrice = bag.totalPrice + req.body.price;
      } else {
        bag.items[req.body._id].qty = bag.items[req.body._id].qty + 1;
        bag.totalQty = bag.totalQty + 1;
        bag.totalPrice = bag.totalPrice + req.body.price;
      }
      return res.json({
        totalQty: req.session.bag.totalQty,
      });
    },

    addFromBag(req, res) {
      let bag = req.session.bag;
      if (!bag.items[req.body._id]) {
        bag.items[req.body._id] = {
          item: req.body,
          qty: 1,
        };
        bag.totalQty = bag.totalQty + 1;
        bag.totalPrice = bag.totalPrice + req.body.price;
      } else {
        bag.items[req.body._id].qty = bag.items[req.body._id].qty + 1;
        bag.totalQty = bag.totalQty + 1;
        bag.totalPrice = bag.totalPrice + req.body.price;
      }
      return res.json({
        totalQty: req.session.bag.totalQty,
        itemQty: req.session.bag.items[req.body._id].qty,
        itemTotalPrice:
          req.session.bag.items[req.body._id].qty *
          req.session.bag.items[req.body._id].item.price,
        totalPrice: req.session.bag.totalPrice,
      });
    },

    removeFromBag(req, res) {
      let bag = req.session.bag;
      if (
        bag.items[req.body._id].qty > 0 &&
        bag.items[req.body._id].qty !== 1
      ) {
        bag.items[req.body._id].qty = bag.items[req.body._id].qty - 1;
        bag.totalQty = bag.totalQty - 1;
        bag.totalPrice = bag.totalPrice - req.body.price;

        return res.json({
          totalQty: req.session.bag.totalQty,
          itemQty: req.session.bag.items[req.body._id].qty,
          itemTotalPrice:
            req.session.bag.items[req.body._id].qty *
            req.session.bag.items[req.body._id].item.price,
          totalPrice: req.session.bag.totalPrice,
        });
      } else if (bag.items[req.body._id].qty === 1) {
        bag.totalQty = bag.totalQty - 1;
        bag.totalPrice = bag.totalPrice - req.body.price;
        delete bag.items[req.body._id];

        return res.json({
          totalQty: req.session.bag.totalQty,
          totalPrice: req.session.bag.totalPrice,
        });
      }
    },
  };
}

module.exports = bagController;
