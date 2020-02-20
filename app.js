const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const mainRoutes = require("./routes/main");
const productsRoutes = require("./routes/products");
const detailsRoutes = require("./routes/details");
const test = require("./routes/tests");

const app = express();
mongoose
  .connect(
    "mongodb+srv://ania:a27C6384b@cluster0-cr7xd.mongodb.net/gl-calc?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("Connected to database");
  })
  .catch(() => {
    console.log("Connection failed");
  });
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );
  next();
});

app.use("/", mainRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/details", detailsRoutes);
app.use("/api/tests", test);

module.exports = app;
