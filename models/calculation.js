const mongoose = require("mongoose");

const calculationSchema = mongoose.Schema({
  date: { type: Date, default: new Date() },
  meal_name: { type: String, required: true },
  products: [
    {
      product: { type: mongoose.Schema.ObjectId, ref: "prod" },
      count: { type: Number, required: true, default: 100 }
    }
  ],
  user_id: { type: mongoose.Schema.ObjectId, ref: "user" }
});

module.exports = mongoose.model("Calculation", calculationSchema);
