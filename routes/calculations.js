import jwt from "jsonwebtoken";
const config = require("../config");
const express = require("express");

const router = express.Router();
const Calculation = require("../models/calculation");
const User = require("../models/user");
const Product = require("../models/product");
const Detail = require("../models/detail");
const authController = require("../controllers/auth");
const ObjectId = require("mongoose").Types.ObjectId;

router.post("/:email", authController.accessTokenVerify, (req, res, next) => {
  const pageSize = req.body.pageSize;
  const skip = (req.body.page - 1) * 2;

  User.findOne({ email: req.params.email }).then(async user => {
    const count = Calculation.count({ email: req.params.email }).exec();

    Calculation.aggregate([
      {
        $match: {
          userId: new ObjectId(user._id)
        }
      },
      {
        $group: { _id: "$date", meals: { $push: "$$ROOT" } }
      },

      {
        $sort: {
          _id: -1
        }
      },
      {
        $limit: pageSize
      },
      {
        $skip: skip
      }
    ])
      .exec()
      .then(calculations => {
        Calculation.populate(calculations, {
          path: "meals.products.product",
          model: Product,
          populate: { path: "details", model: Detail }
        })
          .then(async calcs => {
            res.status(201).json({
              calculations: { ...calcs },
              details: { pageSize: pageSize, page: req.body.page, count: count }
            });
          })
          .catch(e => {
            res.status(400).message("Problem z pobraniem danych");
          });
      })
      .catch(e => {
        res.status(400).message("Problem z pobraniem danych");
      });
  });
});

router.post(
  "/:email/add-calculation",
  authController.accessTokenVerify,
  (req, res, next) => {
    User.findOne({ email: req.params.email })
      .then(user => {
        const toSave = req.body.calculations.calculations.map(calc => {
          return {
            date: new Date(req.body.calculations.date),
            mealNumber: calc.mealNumber,
            products: calc.products.map(product => ({
              count: product.count,
              product: product.id
            })),
            userId: user._id
          };
        });
        Calculation.insertMany(toSave)
          .then(response => {
            res.status(201).json(response);
          })
          .catch(e => {
            console.log(e);
          });
      })
      .catch(e => {
        console.log(e);
      });
  }
);

module.exports = router;
