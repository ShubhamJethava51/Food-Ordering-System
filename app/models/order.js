const mongoose = require("mongoose");
const Schema = mongoose.Schema; //class name start with capital letter

const orderSchema = new Schema(
  {
    customerID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: { type: Object, required: true },
    phone: { type: String, required: true },
    address: { type: String, default: "COD" },
    status: { type: String, default: "order_placed" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
