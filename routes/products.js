const express = require('express');

const router = express.Router();
const Product = require('../models/product');

// get all products
router.get('/', (req, res, next) => {
  Product.find().then((documents) => {
    res.status(200).json({
      products: documents.map((item) => item)
    });
  });
});

// get last added products
router.get('/last-added', (req, res, next) => {
  Product.find()
    .sort('added')
    .limit(10)
    .then((documents) => {
      res.status(200).json({
        products: documents.map((item) => item)
      });
    });
});

// search products
router.get('/search/:searchValue', (req, res, next) => {
  Product.find().then((documents) => {
    const filteredDocuments = documents.filter(
      (document) => (document.name_pl.toLowerCase().includes(req.params.searchValue.toLowerCase())
          || document.name.toLowerCase().includes(req.params.searchValue.toLowerCase()))
    );
    res.status(200).json({
      products: filteredDocuments.map((item) => item),
      count: filteredDocuments.length
    });
  }).catch((e) => {
    res.status(404).json({
      message: e.message
    });
  });
});

// save new product in db
router.post('/', (req, res, next) => {
  const product = new Product({
    name: req.body.product.name,
    name_pl: req.body.product.name_pl,
    cat: req.body.product.cat,
    reporturl: req.body.product.reporturl,
    photo: req.body.product.photo
  });
  product.save().then((item) => {
    console.log('Product added successfully');
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
