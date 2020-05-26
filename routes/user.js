const express = require("express");

const authController = require("../controllers/auth");
const User = require("../models/user");
const bcrypt = require("bcrypt");
import jwt from "jsonwebtoken";
const config = require("../config");
const email = require("../controllers/email");
const router = express.Router();

router.post("/login", (req, res, next) => {
  User.findOne(
    {
      email: req.body.email
    },
    (err, user) => {
      if (err || !user) {
        res.status(401).send({
          message: "Nie znaleziono użytkownika o podanym adresie email"
        });
        next(err);
      } else if (bcrypt.compareSync(req.body.password, user.password)) {
        res.json(
          authController.generateTokens(req, {
            ...user,
            email: req.body.email
          })
        );
      } else {
        res.status(401).send({
          message: "Niepoprawne hasło"
        });
      }
    }
  ).select("password");
});

router.post("/refresh", (req, res, next) => {
  if (!req.body.refreshToken) {
    res.status(401).send({ message: "Token refresh is missing" });
  }
  const BEARER = "Bearer";
  const REFRESH_TOKEN = req.body.refreshToken.split(" ");
  if (REFRESH_TOKEN[0] !== BEARER) {
    return res.status(401).send({ error: "Token is not complete" });
  }
  jwt.verify(REFRESH_TOKEN[1], config.TOKEN_SECRET_JWT, function(err, payload) {
    if (err) {
      return res.status(401).send({ error: "Token refresh is invalid" });
    }
    User.findById(payload.sub, function(err, person) {
      if (!person) {
        return res.status(401).send({ error: "Person not found" });
      }
      return res.json(authController.generateTokens(req, person));
    });
  });
});

// secure router
router.post("/details", authController.accessTokenVerify, (req, res, next) => {
  User.findOne({ email: req.body.email }, {}, (err, user) => {
    if (err || !user) {
      res.status(401).send({ message: "Unauthorized" })``;
      next(err);
    } else {
      res.json({ status: "success", user: user });
    }
  });
});

router.post("/send-confirmation-email", (req, res, next) => {
  User.findOne({ email: req.body.email }, {}, (err, user) => {
    if (err || !user) {
      res.status(401).send({
        message:
          "Wystąpił błąd podczas wysyłania emaila. Spróbuj ponownie lub skontaktuj się z administratorem."
      });
      next(err);
    } else {
      email.sendConfirmationEmail(
        user.name,
        user.email,
        authController.generateTokens(req, user)
      );
      res.json({
        status: "success",
        message: "Wiadomość została pomyślnie wysłana na adres: " + user.email,
        user: user
      });
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
            email.sendConfirmationEmail(
              req.body.name,
              req.body.email,
              authController.generateTokens(req, result)
            );
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

router.get("/confirm/:email/:token", (req, res, next) => {
  jwt.verify(req.params.token, config.TOKEN_SECRET_JWT, function(err, payload) {
    if (err) {
      res.redirect(`${config.UI_URL}/token-error?errorType=invalid-token`);
    }
    User.findById(payload.sub, function(err, person) {
      if (!person) {
        res.redirect(`${config.UI_URL}/token-error?errorType=user-not-found`);
      } else if (person.email !== req.params.email) {
        res.redirect(
          `${config.UI_URL}/token-error?errorType=token-assigned-to-another-user`
        );
      } else {
        if (person.emailConfirmed) {
          res.redirect(
            `${config.UI_URL}/token-error?errorType=user-has-already-confirmed-email`
          );
        } else {
          person.emailConfirmed = true;
          person.save(() => {
            res.redirect(`${config.UI_URL}/token-success`);
          });
        }
      }
    });
  });
});

module.exports = router;
