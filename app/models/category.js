const mongoose = require("mongoose");
const Schema = mongoose.Schema; //class name start with capital letter

const categorySchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("category", categorySchema);
