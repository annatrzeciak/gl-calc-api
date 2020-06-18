const debug = require("debug")("controller:user");

const Calculation = require("../models/calculation");
const Product = require("../models/product");
const Detail = require("../models/detail");

exports.getTodayCalculations = async (res, user) => {
  Calculation.aggregate([
    {
      $match: {
        userId: user._id,
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
      }).then(calcs => {
        debug("Return today calculations");
        const todayCalcs = calcs[0].meals;
        res.status(201).json({
          calculations: { ...todayCalcs }
        });
      });
    })
    .catch(e => {
      debug("Error during getting data", e);
      res.status(400).text("Problem z pobraniem danych");
    });
};

exports.getCalculations = async (req, res, user, pageSize, skip) => {
  const count = Calculation.countDocuments({
    email: req.params.email
  }).exec();
  debug("User has calculations:", count);

  Calculation.aggregate([
    {
      $match: {
        userId: user._id
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
        .then(calcs => {
          debug("Return calculations");
          res.status(201).json({
            calculations: { ...calcs },
            details: { pageSize: pageSize, page: req.body.page, count: count }
          });
        })
        .catch(e => {
          debug("Error during getting data", e);
          res.status(400).message("Problem z pobraniem danych");
        });
    })
    .catch(e => {
      debug("Error during getting data", e);
      res.status(400).message("Problem z pobraniem danych");
    });
};
