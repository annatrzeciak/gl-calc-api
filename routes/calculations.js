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
    const count = Calculation.countDocuments({
      email: req.params.email
    }).exec();

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
router.get(
  "/:email/today",
  authController.accessTokenVerify,
  (req, res, next) => {
    User.findOne({ email: req.params.email }).then(async user => {
      console.log("GET today calculations");
      Calculation.aggregate([
        {
          $match: {
            userId: new ObjectId(user._id),
            date: new Date(new Date().toDateString())
          }
        },
        {
          $group: { _id: "$date", meals: { $push: "$$ROOT" } }
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
              const todayCalcs = calcs[0].meals;
              res.status(201).json({
                calculations: { ...todayCalcs }
              });
            })
            .catch(e => {
              res.status(400).text("Problem z pobraniem danych");
            });
        })
        .catch(e => {
          res.status(400).text("Problem z pobraniem danych");
        });
    });
  }
);

router.post(
  "/:email/add-calculation",
  authController.accessTokenVerify,
  (req, res, next) => {
    User.findOne({ email: req.params.email })
      .then(user => {
        req.body.calculations.calculations.forEach((calc, i) => {
          if (calc._id) {
            console.log("Update calculation " + calc._id);
            Calculation.findOne({
              _id: calc._id
            }).then(calculation => {
              if (calc.products.length) {
                calculation.products = calc.products.map(product => {
                  return {
                    count: product.count,
                    product: new ObjectId(product.product._id)
                  };
                });
                calculation
                  .save()
                  .then(r => console.log("Calculation " + r._id + " saved"))
                  .catch(e =>
                    console.error(
                      "Error during saving calculation id: " +
                        calculation._id +
                        " message: " +
                        e.message
                    )
                  );
              } else {
                calculation
                  .delete()
                  .then(r => console.log("Calculation " + r._id + " deleted"))
                  .catch(e =>
                    console.error(
                      "Error during deleting calculation id: " +
                        calculation._id +
                        " message: " +
                        e.message
                    )
                  );
              }
            });
          } else {
            console.log("Create new calculation");
            const cal = new Calculation({
              _id: new ObjectId(),
              date: new Date(req.body.calculations.date),
              mealNumber: calc.mealNumber,
              products: calc.products.map(product => ({
                count: product.count,
                product: product.product._id
              })),
              userId: user._id
            });
            cal
              .save()
              .then(r => console.log("Calculation " + r._id + " added"))
              .catch(e =>
                console.error(
                  "Error during adding calculation, message: " + e.message
                )
              );
          }
          if (i == req.body.calculations.calculations.length - 1) {
            res.status(201).json({ status: "OK" });
          }
        });
      })
      .catch(e => {
        console.log(e);
      });
  }
);

module.exports = router;
