const item = require("../../models/item");
const category = require("../../models/category");
const subcategory = require("../../models/subcategory");

function menuController() {
  return {
    async index(req, res) {
      const dishes = await item.find();
      const categories = await category.find({ sort: { name: 1 } });
      res.render("menu", { items: dishes, categories });
    },

    async showSingleCategory(req, res) {
      //finding categories by their url id
      const FoundCat = await category.findById(req.params.id);
      const subcatFromCat = await subcategory.find({
        categoryID: FoundCat._id,
      });
      const items = await item.find();

      if (FoundCat && subcatFromCat && items) {
        res.render("singlecategory", { FoundCat, subcatFromCat, items });
      } else {
        return res.redirect("/");
      }
    },
  };
}

module.exports = menuController;
