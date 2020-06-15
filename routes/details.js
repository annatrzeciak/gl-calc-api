const debug = require("debug")("routes:details");
const express = require("express");

const router = express.Router();
const Detail = require("../models/detail");
const ObjectId = require("mongoose").Types.ObjectId;

router.get("/:id", (req, res, next) => {
  debug("GET /details/:id");
  debug("Get product details id: " + req.params.id);
  Detail.findOne({ _id: new ObjectId(req.params.id) }).then(detail => {
    res.status(200).json({
      details: detail
    });
  });
});

module.exports = router;
