const mongoose = require("mongoose");

const calculationSchema = mongoose.Schema({
  _id: { type: mongoose.Schema.ObjectId },
  date: { type: Date, default: new Date() },
  mealNumber: { type: Number, required: true },
  products: [
    {
      product: { type: mongoose.Schema.ObjectId, ref: "prod" },
      count: { type: Number, required: true, default: 100 }
    }
  ],
  userId: { type: mongoose.Schema.ObjectId, ref: "user" }
});

module.exports = mongoose.model("Calculation", calculationSchema);
