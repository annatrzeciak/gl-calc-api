const express = require("express");

const router = express.Router();
const Detail = require("../models/detail");
const ObjectId = require("mongoose").Types.ObjectId;

// get product details
router.get("/:id", (req, res, next) => {
  Detail.find({ _id: new ObjectId(req.params.id) }).then(documents => {
    res.status(200).json({
      details: documents[0]
    });
  });
});

module.exports = router;
