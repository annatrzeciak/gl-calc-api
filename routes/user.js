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

router.post("/register", (req, res, next) => {
  authController.validateEmailAccessibility(req.body.email).then(valid => {
    if (valid) {
      User.create(
        {
          name: req.body.name,
          email: req.body.email,
          password: req.body.password
        },
        (error, result) => {
          if (error) next(error);
          else {
            res.json({
              message: "Użytkownik został utworzony"
            });
          }
        }
      );
    } else {
      res
        .status(409)
        .send({ message: "Użytkownik o podanym adresie email już istnieje" });
    }
  });
});

module.exports = router;
