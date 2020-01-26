const express = require("express");

const router = express.Router();
const Product = require("../models/product");

router.get("", (req, res, next) => {
  Product.find().then(documents => {
    res.status(200).json({
      products: documents.map(item => {
        return item;
      })
    });
  });
});
//save new product in db
router.post("", (req, res, next) => {
  const product = new Product({
    name: req.body.product.name,
    name_pl: req.body.product.name_pl,
    cat: req.body.product.cat,
    reporturl: req.body.product.reporturl,
    photo: req.body.product.photo
  });
  product.save().then(item => {
    console.log("Product added successfully");
    res.status(201).json({
      product: {
        id: item._id,
        name: item.name,
        name_pl: item.name_pl,
        cat: item.cat,
        reporturl: item.reporturl,
        photo: item.photo
      }
    });
  });
});

module.exports = router;
