const item = require("../../../models/item");
const category = require("../../../models/category");
const subcategory = require("../../../models/subcategory");
const order = require("../../../models/order");
const user = require("../../../models/user");
const moment = require("moment");
const { count } = require("../../../models/item");

function adminPanelControlller() {
  return {
    async index(req, res) {
      const items = await item.find();
      const categories = await category.find();
      const subcategories = await subcategory.find();
      const userOrders = {};

      const users = user.find({}, "-password").cursor();
      //async will work inside a for loop
      await users.eachAsync(async (selectedUser) => {
        const countOrder = await order.countDocuments({
          customerID: selectedUser,
        });
        userOrders[selectedUser._id] = countOrder;
      });
      const usersdata = await user.find(
        { role: { $ne: "admin" } },
        "-password",
        { sort: { createdAt: 1 } }
      );
      const itemLength = items.length;
      const categoriesLength = categories.length;
      const subcategoriesLength = subcategories.length;

      res.render("admin/index", {
        moment: moment,
        users: usersdata,
        itemsNum: itemLength,
        categoriesNum: categoriesLength,
        subcategoriesNum: subcategoriesLength,
        userOrderCount: userOrders,
      });
    },
  };
}

module.exports = adminPanelControlller;
