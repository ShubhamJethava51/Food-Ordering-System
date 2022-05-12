const moment = require("moment");
const item = require("../../../../models/item");
const subcategory = require("../../../../models/subcategory");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../../../../public/img/items/"));
  },
  filename: (req, file, cb) => {
    cb(null, `${file.originalname}`);
  },
});
const upload = multer({
  storage: multerStorage,
}).single("itemImage");

function itemController() {
  return {
    //display

    async showItems(req, res) {
      await item
        .find({ sorted: { createdAt: -1 } })
        .populate("subcategoryID")
        .exec((err, items) => {
          if (err) {
            req.flash("error", "Something went wrong while fetching items");
            return res.redirect("/");
          }
          res.render("admin/items/index", {
            items: items,
            moment: moment,
          });
        });
    },

    //manage
    manageItems(req, res) {
      res.render("admin/items/manage");
    },

    //add

    addItems(req, res) {
      upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
          req.flash("error", "Something went wrong with multer");
          return res.redirect("/admin/items/manage");
        } else if (err) {
          req.flash("error", "Something went wrong");
          return res.redirect("/admin/items/manage");
        }
        const { subcatName, itemName, description, itemPrice } = req.body;

        //checking if field is empty
        if (
          !subcatName ||
          !itemName ||
          !description ||
          !itemPrice ||
          !req.file
        ) {
          req.flash("error", "Every field is required.");
          return res.redirect("/admin/items/manage");
        }

        //now checking if same category exist or not
        subcategory.exists({ name: subcatName }, (err, subCatResult) => {
          if (err) {
            req.flash("error", "Something went wrong");
            return res.redirect("/admin/items");
          } else if (!subCatResult) {
            req.flash("error", "Subcategory does not exist!");
            return res.redirect("/admin/items/manage");
          }

          item.exists({ name: itemName }, (err, result) => {
            if (result) {
              req.flash("error", "Item already exist");
              return res.redirect("/admin/items/manage");
            }

            const itemObj = {
              subcategoryID: subCatResult._id,
              name: itemName,
              description: description,
              price: itemPrice,
              image: req.file.originalname,
            };

            item.create(itemObj, (err, result) => {
              if (err) {
                req.flash("error", "Something went wrong");
                return res.redirect("/admin/items/manage");
              }
              req.flash("success", "Item added");
              return res.redirect("/admin/items");
            });
          });
        });
      });
    },

    //delete item

    async deleteItems(req, res) {
      //deleting image for the field too

      const deleteItem = await item.findOne({
        name: req.body.item,
      });

      //for deleting file we will need a module 'fs' which have a function name 'unlink'
      await fs.unlink(
        path.join(
          __dirname,
          `../../../../../public/img/items/${deleteItem.image}`
        ),
        (err) => {
          if (err) {
            console.log(err);
            req.flash("error", "Something went wrong");
            return res.redirect("/admin/items");
          }
        }
      );

      //after deleting image it will delete it from database
      await item.deleteOne({ name: req.body.item }).exec((err, result) => {
        if (err) {
          req.flash("error", "Something went wrong while deleting items!");
          return res.redirect("/admin/items");
        }
        if (result.deletedCount > 0) {
          req.flash("success", "Deleted item successfully!");
          return res.redirect("/admin/items");
        } else {
          req.flash("error", "Item didn't get deleted!");
          return res.redirect("/admin/items");
        }
      });
    },

    //update form for post request

    updateFormItems(req, res) {
      const itemInfo = JSON.parse(req.body.item);
      req.flash("itemID", itemInfo._id);
      req.flash("subcatName", itemInfo.subcategoryID.name);
      req.flash("itemName", itemInfo.name);
      req.flash("description", itemInfo.description);
      req.flash("itemPrice", itemInfo.price);
      req.flash("itemImage", itemInfo.image);
      return res.redirect("/admin/items/manage");
    },

    //actual update request

    updateItems(req, res) {
      upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
          req.flash("error", "Something went wrong with multer");
          return res.redirect("/admin/items/manage");
        } else if (err) {
          req.flash("error", "Something went wrong");
          return res.redirect("/admin/items/manage");
        }

        const { itemName, description, itemPrice, itemImage, itemID } =
          req.body;

        if (req.file) {
          //file is given and it is same as previous one
          if (req.file.originalname === itemImage) {
            item.updateOne(
              { _id: itemID },
              { name: itemName, description: description, price: itemPrice },
              (err) => {
                if (err) {
                  req.flash("error", "Something went wrong");
                  return res.redirect("/admin/items");
                }
                req.flash("success", "Item updated successfully");
                return res.redirect("/admin/items");
              }
            );
          } else {
            //file is given and it is not same as previous one, so deleting previous one
            fs.readdir(
              path.join(__dirname, "../../../../../public/img/items/"),
              (err, files) => {
                if (err) {
                  req.flash("error", "Something went wrong");
                  return res.redirect("/admin/items");
                }
                //finding matching image from folder
                const img = files.find((image) => image === itemImage);
                if (img) {
                  //if file exist
                  fs.unlink(
                    path.join(
                      __dirname,
                      "../../../../../public/img/items/",
                      img
                    ),
                    (err) => {
                      if (err) {
                        req.flash("error", "Something went wrong");
                        return res.redirect("/admin/items");
                      }
                      item.updateOne(
                        { _id: itemID },
                        {
                          name: itemName,
                          description: description,
                          price: itemPrice,
                          image: req.file.originalname,
                        },
                        (err) => {
                          if (err) {
                            req.flash("error", "Something went wrong");
                            return res.redirect("/admin/items");
                          }
                          req.flash("success", "Item updated successfully");
                          return res.redirect("/admin/items");
                        }
                      );
                    }
                  );
                } else {
                  //matching file does not exist for deletion
                  item.updateOne(
                    { _id: itemID },
                    {
                      //then simply just update without image
                      name: itemName,
                      description: description,
                      price: itemPrice,
                      image: req.file.originalname,
                    },
                    (err) => {
                      if (err) {
                        req.flash("error", "Something went wrong");
                        return res.redirect("/admin/items");
                      }
                      req.flash("success", "Item updated successfully");
                      return res.redirect("/admin/Items");
                    }
                  );
                }
              }
            );
          }
        } else {
          //didn't gave image
          item.updateOne(
            { _id: itemID },
            {
              name: itemName,
              description: description,
              price: itemPrice,
            },
            (err) => {
              if (err) {
                req.flash("error", "Something went wrong");
                return res.redirect("/admin/items");
              }
              req.flash("success", "Item updated successfully");
              return res.redirect("/admin/items");
            }
          );
        }
      });
    },
  };
}

module.exports = itemController;
