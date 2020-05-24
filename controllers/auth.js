const jwt = require("jsonwebtoken");
const User = require("../models/user");
const config = require("../config");

// Validate email address
exports.validateEmailAccessibility = email => {
  return User.findOne({
    email
  }).then(result => !result);
};

// Generate token
exports.generateTokens = (req, user) => {
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
    refreshToken: REFRESH_TOKEN,
    user: user.email
  };
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
