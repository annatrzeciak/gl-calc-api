const mongoose = require("mongoose");

const subscriptionSchema = mongoose.Schema({
  _id: { type: mongoose.Schema.ObjectId },
  startDate: { type: Date, default: new Date() },
  endDate: { type: Date },
  status: { type: String },
  metadata: { type: Object, required: true },
  items: { type: Object },
  userId: { type: mongoose.Schema.ObjectId, ref: "user" }
});

module.exports = mongoose.model("Subscription", subscriptionSchema);
