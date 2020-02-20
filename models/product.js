const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
  _id: { type: Number },
  name: { type: String, required: true },
  name_pl: { type: String, required: false },
  cat: { type: String, required: true },
  reporturl: { type: String, required: false },
  photo: { type: String, required: false }
});

module.exports = mongoose.model('Product', productSchema);
