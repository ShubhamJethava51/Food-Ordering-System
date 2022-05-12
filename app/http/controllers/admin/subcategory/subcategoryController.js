const subcategory = require("../../../../models/subcategory");
const category = require("../../../../models/category");
const path = require("path");
const moment = require("moment");
const fs = require("fs");

//multer configuration

const multer = require("multer");
const { update } = require("../../../../models/subcategory");
const item = require("../../../../models/item");
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../../../../public/img/subcategories/"));
  },
  filename: (req, file, cb) => {
    cb(null, `${file.originalname}`);
  },
});

const upload = multer({
  storage: multerStorage,
}).single("subcatImage");

//builder function

function subcategoryController() {
  return {
    //display subcategories

    async showSubcategories(req, res) {
      await subcategory
        .find({
          sorted: { createdAt: -1 },
        })
        .populate("categoryID")
        .exec((err, subcategories) => {
          if (err) {
            req.flash(
              "error",
              "Something went wrong while fetching subcategories"
            );
            return res.redirect("/");
          }
          res.render("admin/subcategories/index", {
            subcategories: subcategories,
            moment: moment,
          });
        });
    },

    //manage

    manageSubcategories(req, res) {
      res.render("admin/subcategories/manage");
    },

    //update form for post request

    updateFormSubcategories(req, res) {
      const subcatInfo = JSON.parse(req.body.subcat);
      req.flash("subcatID", subcatInfo._id);
      req.flash("catName", subcatInfo.categoryID.name);
      req.flash("subcatName", subcatInfo.name);
      req.flash("description", subcatInfo.description);
      req.flash("subcatImage", subcatInfo.image);
      return res.redirect("/admin/subcategories/manage");
    },

    //actual update request

    updateSubcategories(req, res) {
      upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
          req.flash("error", "Something went wrong with multer");
          return res.redirect("/admin/subcategories/manage");
        } else if (err) {
          req.flash("error", "Something went wrong");
          return res.redirect("/admin/subcategories/manage");
        }

        const { subcatName, description, subcatImage, subcatID } = req.body;

        if (req.file) {
          //file is given and it is same as previous one
          if (req.file.originalname === subcatImage) {
            subcategory.updateOne(
              { _id: subcatID },
              { name: subcatName, description: description },
              (err) => {
                if (err) {
                  req.flash("error", "Something went wrong");
                  return res.redirect("/admin/subcategories");
                }
                req.flash("success", "Subcategory updated successfully");
                return res.redirect("/admin/subcategories");
              }
            );
          } else {
            //file is given and it is not same as previous one, so deleting previous one
            fs.readdir(
              path.join(__dirname, "../../../../../public/img/subcategories/"),
              (err, files) => {
                const img = files.find((image) => image === subcatImage);
                if (img) {
                  fs.unlink(
                    path.join(
                      __dirname,
                      "../../../../../public/img/subcategories/",
                      img
                    ),
                    (err) => {
                      if (err) {
                        req.flash("error", "Something went wrong");
                        return res.redirect("/admin/subcategories");
                      }
                      subcategory.updateOne(
                        { _id: subcatID },
                        {
                          name: subcatName,
                          description: description,
                          image: req.file.originalname,
                        },
                        (err) => {
                          if (err) {
                            req.flash("error", "Something went wrong");
                            return res.redirect("/admin/subcategories");
                          }
                          req.flash(
                            "success",
                            "Subcategory updated successfully"
                          );
                          return res.redirect("/admin/subcategories");
                        }
                      );
                    }
                  );
                } else {
                  subcategory.updateOne(
                    { _id: subcatID },
                    {
                      name: subcatName,
                      description: description,
                      image: req.file.originalname,
                    },
                    (err) => {
                      if (err) {
                        req.flash("error", "Something went wrong");
                        return res.redirect("/admin/subcategories");
                      }
                      req.flash("success", "Subcategory updated successfully");
                      return res.redirect("/admin/subcategories");
                    }
                  );
                }
              }
            );
          }
        } else {
          subcategory.updateOne(
            { _id: subcatID },
            {
              name: subcatName,
              description: description,
            },
            (err) => {
              if (err) {
                req.flash("error", "Something went wrong");
                return res.redirect("/admin/subcategories");
              }
              req.flash("success", "Subcategory updated successfully");
              return res.redirect("/admin/subcategories");
            }
          );
        }
      });
    },

    //add

    async addSubcategories(req, res) {
      upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
          req.flash("error", "Something went wrong with multer");
          return res.redirect("/admin/subcategories/manage");
        } else if (err) {
          req.flash("error", "Something went wrong");
          return res.redirect("/admin/subcategories/manage");
        }

        const { catName, subcatName, description } = req.body;

        if (!catName || !subcatName || !description || !req.file) {
          //checking if field is empty
          req.flash("error", "Every field is required.");
          return res.redirect("/admin/subcategories/manage");
        }

        // checking if category exist or not

        category.exists({ name: catName }, (err, catResult) => {
          if (err) {
            req.flash("error", "Something went wrong");
            return res.redirect("/admin/subcategories");
          } else if (!catResult) {
            req.flash("error", "Category does not exist!");
            return res.redirect("/admin/subcategories/manage");
          }

          subcategory.exists({ name: subcatName }, (err, result) => {
            if (err) {
              req.flash("error", "Something went wrong");
              return res.redirect("/admin/subcategories");
            } else if (result) {
              req.flash("error", "Item already exist");
              return res.redirect("/admin/subcategories/manage");
            }

            const subcategoryOBJ = {
              categoryID: catResult._id,
              name: subcatName,
              description: description,
              image: req.file.originalname,
            };

            subcategory.create(subcategoryOBJ, (err, result) => {
              if (err) {
                req.flash("error", "Something went wrong");
                return res.redirect("/admin/subcategories/manage");
              }
              req.flash("success", "Subcategory added");
              return res.redirect("/admin/subcategories");
            });
          });
        });
      });
    },

    //delete

    async deleteSubcategories(req, res) {
      //deleting image for the field too

      const deleteSub = await subcategory.findOne({
        name: req.body.subcategory,
      });

      //for deleting file we will need a module 'fs' which have a function name 'unlink'
      await fs.unlink(
        path.join(
          __dirname,
          `../../../../../public/img/subcategories/${deleteSub.image}`
        ),
        (err) => {
          if (err) {
            console.log(err);
            req.flash("error", "Something went wrong");
            return res.redirect("/admin/subcategories");
          }
        }
      );

      //after deleting image it will delete it from database
      await subcategory
        .deleteOne({ name: req.body.subcategory })
        .exec((err, result) => {
          if (err) {
            req.flash(
              "error",
              "Something went wrong while deleting subcategories!"
            );
            return res.redirect("/admin/subcategories");
          }
          if (result.deletedCount > 0) {
            req.flash("success", "Deleted subcategory successfully!");
            return res.redirect("/admin/subcategories");
          } else {
            req.flash("error", "Subcategory didn't get deleted!");
            return res.redirect("/admin/subcategories");
          }
        });
    },
  };
}

module.exports = subcategoryController;
