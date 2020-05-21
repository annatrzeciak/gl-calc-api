const express = require("express");
const authController = require("../controllers/auth");
const User = require("../models/user");

const router = express.Router();

router.post("/login", authController.loginUser);
router.post("/refresh", authController.refreshTokenVerify);

// secure router
router.post("/details", authController.accessTokenVerify, (req, res, next) => {
  User.find({ email: req.body.email }, {}, (err, user) => {
    if (err || !user) {
      res.status(401).send({ message: "Unauthorized" })``;
      next(err);
    } else {
      res.json({ status: "success", user: user[0] });
    }
  });
});

router.post(
  "/register",
  authController.accessTokenVerify,
  authController.createUser
);

module.exports = router;
