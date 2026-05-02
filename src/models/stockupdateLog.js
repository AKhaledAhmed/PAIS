const mongoose = require("mongoose");

const stockUpdateLogSchema = new mongoose.Schema(
  {
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pharmacy",
      required: true,
      index: true,
    },
    drugId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Drug",
      required: true,
    },
    oldQuantity: {
      type: Number,
      required: true,
    },
    newQuantity: {
      type: Number,
      required: true,
    },
    oldPrice: Number,
    newPrice: Number,
  },
  { timestamps: true } 
);

module.exports = mongoose.model("StockUpdateLog", stockUpdateLogSchema);