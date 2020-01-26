const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  name:{ type: String, required: true },
  name_pl:{ type: String, required: true },
  cat: { type: String, required: true },
  reporturl: { type: String, required: false },
  photo: { type: String, required: false }
});

module.exports = mongoose.model("Product", productSchema);
