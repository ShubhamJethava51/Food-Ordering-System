const homeController = require("../app/http/controllers/homeController");
const authController = require("../app/http/controllers/authController");
const bagController = require("../app/http/controllers/customers/bagController");
const orderController = require("../app/http/controllers/customers/orderController");
const adminOrderController = require("../app/http/controllers/admin/orderController");
const statusOrderController = require("../app/http/controllers/admin/statusController");
const adminPanelControlller = require("../app/http/controllers/admin/adminPanelController");
const categoryController = require("../app/http/controllers/admin/category/categoryController");
const subcategoryController = require("../app/http/controllers/admin/subcategory/subcategoryController");
const itemController = require("../app/http/controllers/admin/item/itemController");
const menuController = require("../app/http/controllers/menuController");

//middlewares
const guest = require("../app/http/middlewares/guest");
const auth = require("../app/http/middlewares/auth");
const admin = require("../app/http/middlewares/admin");
const { authenticate } = require("passport/lib");

function initRoutes(app) {
  app.get("/", homeController().index);
  app.get("/aboutus", homeController().aboutus);
  //menu
  app.get("/menu", menuController().index);
  app.get("/menu/categories/:id", menuController().showSingleCategory);

  //authentication
  app.get("/login", guest, authController().login);
  app.post("/login", authController().postLogin);

  app.get("/register", guest, authController().register);
  app.post("/register", authController().postRegister);

  app.post("/logout", authController().logout);

  app.get("/forgotPassForm", authController().forgotPassForm);
  app.post("/resetLinkSend", authController().resetLinkSend);
  app.get("/resetPassword/:id/:token", authController().resetPassForm);
  app.post("/resetPassword", authController().postResetPassword);

  //bag
  app.get("/bag", bagController().index);
  app.post("/update-bag", bagController().update);
  //add item from bag
  app.post("/update-item-rows-add", bagController().addFromBag);
  //remove item from bag
  app.post("/update-item-rows-remove", bagController().removeFromBag);

  //customer routes (like orders and etc.)
  app.post("/orders", auth, orderController().orderStore);
  app.get("/customer/orders", auth, orderController().index);
  app.get("/customer/order/:id", auth, orderController().show);

  //admin routes

  //admin panel
  app.get("/admin", admin, adminPanelControlller().index);

  //category
  //manage (update or add form)
  app.get(
    "/admin/categories/manage",
    admin,
    categoryController().manageCategories
  );

  //it will get us page for update
  app.post(
    "/admin/categories/updateForm",
    admin,
    categoryController().updateFormCategories
  );

  //updating with post request from above form
  app.post(
    "/admin/categories/update",
    admin,
    categoryController().updateCategories
  );

  //display
  app.get("/admin/categories", admin, categoryController().showCategories);

  //add
  app.post("/admin/categories/add", admin, categoryController().addCategories);

  //delete
  app.post(
    "/admin/categories/delete",
    admin,
    categoryController().deleteCategories
  );

  //subcategories
  //display
  app.get(
    "/admin/subcategories",
    admin,
    subcategoryController().showSubcategories
  );

  //manage (update or add form)
  app.get(
    "/admin/subcategories/manage",
    admin,
    subcategoryController().manageSubcategories
  );

  //it will get us page for update
  app.post(
    "/admin/subcategories/updateForm",
    admin,
    subcategoryController().updateFormSubcategories
  );

  //updating with post request from above form

  app.post(
    "/admin/subcategories/update",
    admin,
    subcategoryController().updateSubcategories
  );

  //add
  app.post(
    "/admin/subcategories/add",
    admin,
    subcategoryController().addSubcategories
  );

  //delete

  app.post(
    "/admin/subcategories/delete",
    admin,
    subcategoryController().deleteSubcategories
  );

  //item
  //display
  app.get("/admin/items", admin, itemController().showItems);

  //manage
  app.get("/admin/items/manage", admin, itemController().manageItems);

  //add
  app.post("/admin/items/add", admin, itemController().addItems);

  //delete
  app.post("/admin/items/delete", admin, itemController().deleteItems);

  //update
  //page for update
  app.post("/admin/items/updateForm", admin, itemController().updateFormItems);

  //updating with post request from above form

  app.post("/admin/items/update", admin, itemController().updateItems);

  //admin orders
  app.get("/admin/orders", admin, adminOrderController().index);
  app.post("/admin/order/status", admin, statusOrderController().update);
}

module.exports = initRoutes;
