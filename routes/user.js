const debug = require("debug")("routes:user");

const express = require("express");

const authController = require("../controllers/auth");
const User = require("../models/user");
const bcrypt = require("bcrypt");
import jwt from "jsonwebtoken";
const config = require("../config");
const email = require("../controllers/email");
const router = express.Router();

router.post("/login", (req, res, next) => {
  debug("POST /user/login");
  debug("User email: " + req.body.email);

  User.findOne(
    {
      email: req.body.email
    },
    (err, user) => {
      if (err || !user) {
        debug("User not found");
        res.status(401).send({
          message: "Nie znaleziono użytkownika o podanym adresie email"
        });
        next(err);
      } else if (bcrypt.compareSync(req.body.password, user.password)) {
        debug("Return generated tokens");
        res.json(
          authController.generateTokens(req, {
            ...user,
            email: req.body.email
          })
        );
      } else {
        debug("Invalid password");
        res.status(401).send({
          message: "Niepoprawne hasło"
        });
      }
    }
  ).select("password");
});

router.post("/refresh", (req, res, next) => {
  debug("POST /user/refresh");

  if (!req.body.refreshToken) {
    debug("Token refresh is missing");
    res.status(401).send({ message: "Token refresh is missing" });
  }
  const BEARER = "Bearer";
  const REFRESH_TOKEN = req.body.refreshToken.split(" ");
  if (REFRESH_TOKEN[0] !== BEARER) {
    debug("Token is not complete");
    return res.status(401).send({ error: "Token is not complete" });
  }
  jwt.verify(REFRESH_TOKEN[1], config.TOKEN_SECRET_JWT, function(err, payload) {
    if (err) {
      debug("Token refresh is invalid");
      return res.status(401).send({ error: "Token refresh is invalid" });
    }
    User.findById(payload.sub, function(err, person) {
      if (!person) {
        debug("User not found");
        return res.status(401).send({ error: "Person not found" });
      }
      debug("Return generated tokens");
      return res.json(authController.generateTokens(req, person));
    });
  });
});

router.post("/details", authController.accessTokenVerify, (req, res, next) => {
  debug("POST /user/details");
  debug("User email: " + req.body.email);
  User.findOne({ email: req.body.email }, {}, (err, user) => {
    if (err || !user) {
      debug("User not found");
      res.status(401).send({ message: "Unauthorized" })``;
      next(err);
    } else {
      debug("Return user details");
      res.json({ status: "success", user: user });
    }
  });
});

router.post("/send-confirmation-email", (req, res, next) => {
  debug("POST /user/send-confirmation-email");
  debug("User email: " + req.body.email);
  User.findOne({ email: req.body.email }, {}, (err, user) => {
    if (err || !user) {
      debug("User not found");
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
      debug("Send confirmation email to user: " + req.body.email);

      res.json({
        status: "success",
        message: "Wiadomość została pomyślnie wysłana na adres: " + user.email,
        user: user
      });
    }
  });
});

router.post("/register", (req, res, next) => {
  debug("POST /user/register");
  debug("User email: " + req.body.email);

  authController.validateEmailAccessibility(req.body.email).then(valid => {
    if (valid) {
      debug("Create new user");
      User.create(
        {
          name: req.body.name,
          email: req.body.email,
          password: req.body.password
        },
        (error, result) => {
          if (error) next(error);
          else {
            debug("Send confirmation email to user: " + req.body.email);
            email.sendConfirmationEmail(
              req.body.name,
              req.body.email,
              authController.generateTokens(req, result)
            );
            debug("New account created, user email: " + req.body.email);
            res.json({
              message: "Użytkownik został utworzony"
            });
          }
        }
      );
    } else {
      debug("The user with this email address already exists");
      res
        .status(409)
        .send({ message: "Użytkownik o podanym adresie email już istnieje" });
    }
  });
});

router.get("/confirm/:email/:token", (req, res, next) => {
  debug("POST /user/confirm/:email/:token");
  debug("User email: " + req.params.email);

  jwt.verify(req.params.token, config.TOKEN_SECRET_JWT, function(err, payload) {
    if (err) {
      debug("Invalid token", err);
      res.redirect(`${config.UI_URL}/token-error?errorType=invalid-token`);
    }
    User.findById(payload.sub, function(err, person) {
      if (!person) {
        debug("User not found");
        res.redirect(`${config.UI_URL}/token-error?errorType=user-not-found`);
      } else if (person.email !== req.params.email) {
        debug("Token assigned to another user");
        res.redirect(
          `${config.UI_URL}/token-error?errorType=token-assigned-to-another-user`
        );
      } else {
        if (person.emailConfirmed) {
          debug("User has already confirmed email");
          res.redirect(
            `${config.UI_URL}/token-error?errorType=user-has-already-confirmed-email`
          );
        } else {
          person.emailConfirmed = true;
          person.save(() => {
            debug("User email confirmed");
            res.redirect(`${config.UI_URL}/token-success`);
          });
        }
      }
    });
  });
});

module.exports = router;
