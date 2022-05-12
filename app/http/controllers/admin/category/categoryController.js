const category = require("../../../../models/category");
const moment = require("moment");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../../../../public/img/categories/"));
  },
  filename: (req, file, cb) => {
    cb(null, `${file.originalname}`);
  },
});
const upload = multer({
  storage: multerStorage,
}).single("catImage");

function categoryController() {
  return {
    // display category

    async showCategories(req, res) {
      const allCategories = await category.find({ sorted: { createdAt: -1 } });
      res.render("admin/categories/index", {
        categories: allCategories,
        moment: moment,
      });
    },

    //manage

    manageCategories(req, res) {
      res.render("admin/categories/manage");
    },

    //add

    addCategories(req, res) {
      upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
          req.flash("error", "Something went wrong with multer");
          return res.redirect("/admin/categories/manage");
        } else if (err) {
          req.flash("error", "Something went wrong");
          console.log(err);
          return res.redirect("/admin/categories/manage");
        }
        const { catName, description } = req.body;

        //checking if field is empty
        if (!catName || !description || !req.file) {
          req.flash("error", "Every field is required.");
          return res.redirect("/admin/categories/manage");
        }

        //now checking if same category exist or not
        category.exists({ name: catName }, (err, result) => {
          if (result) {
            req.flash("error", "Category already exist");
            return res.redirect("/admin/categories/manage");
          }

          const categoryObj = {
            name: catName,
            description: description,
            image: req.file.originalname,
          };

          category.create(categoryObj, (err, result) => {
            if (err) {
              req.flash("error", "Something went wrong");
              return res.redirect("/admin/categories/manage");
            }
            req.flash("success", "Category added");
            return res.redirect("/admin/categories");
          });
        });
      });
    },

    async deleteCategories(req, res) {
      //deleting image for the field too

      const deleteCat = await category.findOne({
        name: req.body.category,
      });

      //for deleting file we will need a module 'fs' which have a function name 'unlink'
      await fs.unlink(
        path.join(
          __dirname,
          `../../../../../public/img/categories/${deleteCat.image}`
        ),
        (err) => {
          if (err) {
            console.log(err);
            req.flash("error", "Something went wrong");
            return res.redirect("/admin/categories");
          }
        }
      );
      await category
        .deleteOne({ name: req.body.category })
        .exec((err, result) => {
          if (err) {
            req.flash(
              "error",
              "Something went wrong while deleting categories!"
            );
            return res.redirect("/admin/categories");
          }
          if (result.deletedCount > 0) {
            req.flash("success", "Deleted category successfully!");
            return res.redirect("/admin/categories");
          } else {
            req.flash("error", "Category didn't get deleted!");
            return res.redirect("/admin/categories");
          }
        });
    },

    //update form for post request

    updateFormCategories(req, res) {
      const catInfo = JSON.parse(req.body.cat);
      req.flash("catID", catInfo._id);
      req.flash("catName", catInfo.name);
      req.flash("description", catInfo.description);
      req.flash("catImage", catInfo.image);
      return res.redirect("/admin/categories/manage");
    },

    updateCategories(req, res) {
      upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
          req.flash("error", "Something went wrong with multer");
          return res.redirect("/admin/categories/manage");
        } else if (err) {
          req.flash("error", "Something went wrong");
          return res.redirect("/admin/categories/manage");
        }

        const { catName, description, catImage, catID } = req.body;

        if (req.file) {
          //file is given and it is same as previous one
          if (req.file.originalname === catImage) {
            category.updateOne(
              { _id: catID },
              { name: catName, description: description },
              (err) => {
                if (err) {
                  req.flash("error", "Something went wrong");
                  return res.redirect("/admin/categories");
                }
                req.flash("success", "Category updated successfully");
                return res.redirect("/admin/Categories");
              }
            );
          } else {
            //file is given and it is not same as previous one, so deleting previous one
            fs.readdir(
              path.join(__dirname, "../../../../../public/img/categories/"),
              (err, files) => {
                const img = files.find((image) => image === catImage);
                if (img) {
                  fs.unlink(
                    path.join(
                      __dirname,
                      "../../../../../public/img/categories/",
                      img
                    ),
                    (err) => {
                      if (err) {
                        req.flash("error", "Something went wrong");
                        return res.redirect("/admin/categories");
                      }
                      category.updateOne(
                        { _id: catID },
                        {
                          name: catName,
                          description: description,
                          image: req.file.originalname,
                        },
                        (err) => {
                          if (err) {
                            req.flash("error", "Something went wrong");
                            return res.redirect("/admin/categories");
                          }
                          req.flash("success", "Category updated successfully");
                          return res.redirect("/admin/categories");
                        }
                      );
                    }
                  );
                } else {
                  category.updateOne(
                    { _id: catID },
                    {
                      name: catName,
                      description: description,
                      image: req.file.originalname,
                    },
                    (err) => {
                      if (err) {
                        req.flash("error", "Something went wrong");
                        return res.redirect("/admin/categories");
                      }
                      req.flash("success", "Category updated successfully");
                      return res.redirect("/admin/categories");
                    }
                  );
                }
              }
            );
          }
        } else {
          category.updateOne(
            { _id: catID },
            {
              name: catName,
              description: description,
            },
            (err) => {
              if (err) {
                req.flash("error", "Something went wrong");
                return res.redirect("/admin/categories");
              }
              req.flash("success", "Category updated successfully");
              return res.redirect("/admin/categories");
            }
          );
        }
      });
    },
  };
}

module.exports = categoryController;
