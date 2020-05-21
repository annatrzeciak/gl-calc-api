const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const config = require("../config");

// Validate email address
function validateEmailAccessibility(email) {
  return User.findOne({
    email
  }).then(result => !result);
}

// Generate token
const generateTokens = (req, user) => {
  const ACCESS_TOKEN = jwt.sign(
    {
      sub: user._id,
      rol: user.role,
      type: "ACCESS_TOKEN"
    },
    config.TOKEN_SECRET_JWT,
    {
      expiresIn: "6h"
    }
  );
  const REFRESH_TOKEN = jwt.sign(
    {
      sub: user._id,
      rol: user.role,
      type: "REFRESH_TOKEN"
    },
    config.TOKEN_SECRET_JWT,
    {
      expiresIn: "24h"
    }
  );
  return {
    accessToken: ACCESS_TOKEN,
    refreshToken: REFRESH_TOKEN
  };
};

// Controller create user
exports.createUser = (req, res, next) => {
  validateEmailAccessibility(req.body.email).then(valid => {
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
              message: "The user was created"
            });
          }
        }
      );
    } else {
      res.status(409).send({
        message: "The request could not be completed due to a conflict"
      });
    }
  });
};

// Controller login user
exports.loginUser = (req, res, next) => {
  User.findOne(
    {
      email: req.body.email
    },
    (err, user) => {
      if (err || !user) {
        res.status(401).send({
          message: "Unauthorized"
        });
        next(err);
      } else if (bcrypt.compareSync(req.body.password, user.password)) {
        res.json({ tokens: generateTokens(req, user), user: req.body.email });
      } else {
        res.status(401).send({
          message: "Invalid email/password"
        });
      }
    }
  ).select("password");
};

// Verify accessToken
exports.accessTokenVerify = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).send({
      error: "Token is missing"
    });
  }
  const BEARER = "Bearer";
  const AUTHORIZATION_TOKEN = req.headers.authorization.split(" ");
  if (AUTHORIZATION_TOKEN[0] !== BEARER) {
    return res.status(401).send({
      error: "Token is not complete"
    });
  }
  jwt.verify(AUTHORIZATION_TOKEN[1], config.TOKEN_SECRET_JWT, err => {
    if (err) {
      return res.status(401).send({
        error: "Token is invalid"
      });
    }
    next();
  });
};

// Verify refreshToken
exports.refreshTokenVerify = (req, res, next) => {
  if (!req.body.refreshToken) {
    res.status(401).send({
      message: "Token refresh is missing"
    });
  }
  const BEARER = "Bearer";
  const REFRESH_TOKEN = req.body.refreshToken.split(" ");
  if (REFRESH_TOKEN[0] !== BEARER) {
    return res.status(401).send({
      error: "Token is not complete"
    });
  }
  jwt.verify(REFRESH_TOKEN[1], config.TOKEN_SECRET_JWT, (err, payload) => {
    if (err) {
      return res.status(401).send({
        error: "Token refresh is invalid"
      });
    }
    User.findById(payload.sub, (err, person) => {
      if (!person) {
        return res.status(401).send({
          error: "Person not found"
        });
      }
      return res.json(generateTokens(req, person));
    });
  });
};
