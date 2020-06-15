const debug = require("debug")("routes:products");

const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const Detail = require("../models/detail");
const ObjectId = require("mongoose").Types.ObjectId;

router.get("/", (req, res, next) => {
  debug("GET /products");
  debug("Get all products");
  Product.find()
    .then(documents => {
      debug("Return all products");
      res.status(200).json({
        products: documents.map(item => item)
      });
    })
    .catch(e => debug("Error during get all products", e));
});

router.get("/last-added", (req, res, next) => {
  debug("GET /products/last-added");
  Product.find()
    .sort("added")
    .limit(10)
    .then(documents => {
      debug("Return last added products");
      res.status(200).json({
        products: documents.map(item => item)
      });
    })
    .catch(e => debug("Error during get last added products", e));
});

router.get("/:id", (req, res, next) => {
  debug("GET /products/:id");
  debug("Get product with id: " + req.params.id);
  if (req.query.withDetails) {
    debug("Get product with details");
    Product.findOne({ _id: new ObjectId(req.params.id) })
      .populate({
        path: "details",
        model: Detail
      })
      .then(product => {
        debug("Return product with details", product._id);
        res.status(200).json({
          product
        });
      });
  } else {
    Product.findOne({ _id: new ObjectId(req.params.id) }).then(product => {
      debug("Return product", product._id);

      res.status(200).json({
        product
      });
    });
  }
});

router.get("/search/:searchValue", (req, res, next) => {
  debug("GET /products/search/:searchValue");
  debug("Search products with name: " + req.params.searchValue);
  Product.find()
    .then(documents => {
      const filteredDocuments = documents.filter(
        document =>
          document.name_pl
            .toLowerCase()
            .includes(req.params.searchValue.toLowerCase()) ||
          document.name
            .toLowerCase()
            .includes(req.params.searchValue.toLowerCase())
      );
      debug("Return filtered products");
      res.status(200).json({
        products: filteredDocuments,
        count: filteredDocuments.length
      });
    })
    .catch(e => {
      debug("Error during filtering products", e);
      res.status(404).json({
        message: e.message
      });
    });
});

router.post("/", (req, res, next) => {
  debug("POST /products");
  debug("Add new product", req.body.product);
  const product = new Product({
    name: req.body.product.name,
    name_pl: req.body.product.name_pl,
    cat: req.body.product.cat,
    reporturl: req.body.product.reporturl,
    photo: req.body.product.photo
  });
  product
    .save()
    .then(item => {
      debug("Product added successfully", item._id);
      res.status(201).json({
        product: {
          _id: item._id,
          name: item.name,
          name_pl: item.name_pl,
          cat: item.cat,
          reporturl: item.reporturl,
          photo: item.photo
        }
      });
    })
    .catch(e => debug("Error during saving new product", e));
});

module.exports = router;
