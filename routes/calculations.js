const debug = require("debug")("routes:calculations");
const express = require("express");

const router = express.Router();
const Calculation = require("../models/calculation");
const User = require("../models/user");
const Product = require("../models/product");
const Detail = require("../models/detail");
const authController = require("../controllers/auth");
const userController = require("../controllers/user");
const ObjectId = require("mongoose").Types.ObjectId;

router.post("/:email", authController.accessTokenVerify, (req, res, next) => {
  debug("POST /calculations/:email");
  debug("User email:", req.params.email);
  const pageSize = req.body.pageSize;
  const skip = (req.body.page - 1) * 2;
  debug("Page size:", pageSize, "Page:", req.body.page);
  User.findOne({ email: req.params.email })
    .then(async user => {
      userController.getCalculations(req, res, user, pageSize, skip);
    })
    .catch(e => {
      debug("Error during getting data", e);
      res.status(400).text("Problem z pobraniem danych");
    });
});

router.get(
  "/:email/today",
  authController.accessTokenVerify,
  (req, res, next) => {
    debug("POST /calculations/:email/today");
    debug("GET today calculations");
    debug("User email:", req.params.email);

    User.findOne({ email: req.params.email })
      .then(user => {
        userController.getTodayCalculations(res, user);
      })
      .catch(e => {
        debug("Error during getting data", e);
        res.status(400).text("Problem z pobraniem danych");
      });
  }
);

router.post(
  "/:email/add-calculation",
  authController.accessTokenVerify,
  (req, res, next) => {
    debug("POST /calculations/:email/add-calculation");
    debug("Add calculation");
    User.findOne({ email: req.params.email })
      .then(user => {
        const saveMeals = new Promise(resolve => {
          req.body.calculations.calculations.forEach((calc, i) => {

            if (calc._id) {
              Calculation.findOne({
                _id: calc._id
              }).then(calculation => {
                if (calc.products.length) {
                  debug("Update calculation " + calc._id);
                  const productsToSave = calc.products.map(product => {
                    return {
                      count: product.count,
                      product: new ObjectId(product.product._id)
                    };
                  });
                  if (calculation.products !== productsToSave) {
                    calculation.products = productsToSave;
                    calculation
                      .save()
                      .then(r => {
                        debug("Calculation " + r._id + " saved");
                        if (
                          i ==
                          req.body.calculations.calculations.length - 1
                        ) {
                          resolve();
                        }
                      })
                      .catch(e =>
                        debug(
                          "Error during saving calculation id: " +
                            calculation._id,
                          e
                        )
                      );
                  }
                } else {
                  debug("Delete calculation " + calc._id);

                  calculation
                    .delete()
                    .then(r => {
                      debug("Calculation " + r._id + " deleted");
                      if (i == req.body.calculations.calculations.length - 1) {
                        resolve();
                      }
                    })
                    .catch(e =>
                      debug(
                        "Error during saving calculation id: " +
                          calculation._id,
                        e
                      )
                    );
                }
              });
            } else {
              debug("Create new calculation");
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
                .then(r => {
                  debug("Calculation " + r._id + " added");
                  if (i == req.body.calculations.calculations.length - 1) {
                    resolve();
                  }
                })
                .catch(e => debug("Error during adding calculation", e));
            }
          });
        });
        saveMeals
          .then(() => {
            userController.getTodayCalculations(res, user);
          })
          .catch(e => debug("Error", e));
      })
      .catch(e => {
        debug("Error", e);
      });
  }
);

module.exports = router;
