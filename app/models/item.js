const mongoose = require("mongoose");
const Schema = mongoose.Schema; //class name start with capital letter

const itemSchema = new Schema(
  {
    subcategoryID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "subcategory",
      required: true,
    },
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Item", itemSchema);
