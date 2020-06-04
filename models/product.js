const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  old_id: { type: Number },
  details_id: { type: String },
  name: { type: String, required: true },
  name_pl: { type: String, required: false },
  cat: { type: String, required: true },
  reporturl: { type: String, required: false },
  photo: { type: String, required: false },
  added: { type: Date, default: new Date() }
});

productSchema.virtual("details", {
  ref: "det",
  localField: "details_id",
  foreignField: "_id",
  justOne: true
});
productSchema.set("toObject", { virtuals: true });
productSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Prod", productSchema);
