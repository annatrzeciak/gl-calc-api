const express = require("express");

const router = express.Router();
const Calculation = require("../models/calculation");
const User = require("../models/user");
const Product = require("../models/product");
const Detail = require("../models/detail");
const authController = require("../controllers/auth");
const ObjectId = require("mongoose").Types.ObjectId;

// save new product in db
router.post("/:email", authController.accessTokenVerify, (req, res, next) => {
  const pageSize = req.body.pageSize;
  const skip = (req.body.page - 1) * 2;
  console.log(req.body);

  User.findOne({ email: req.params.email }).then(user => {
    const count = Calculation.count({ email: req.params.email }).exec();
    Calculation.find({ user_id: new ObjectId(user._id) }, null, {
      sort: { date: -1 },
      limit: pageSize,
      skip: skip
    })
      .populate({
        path: "products.product",
        model: Product,
        populate: { path: "details", model: Detail }
      })
      .then(async calculations => {
        res.status(201).json({
          calculations: { ...calculations },
          details: { pageSize: pageSize, page: req.body.page, count: count }
        });
      })
      .catch(e => {
        console.log(e);
      });
  });
});

module.exports = router;
