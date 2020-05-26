const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");

const mainRoutes = require("./routes/main");
const productsRoutes = require("./routes/products");
const detailsRoutes = require("./routes/details");
const userRoutes = require("./routes/user");

const config = require("./config");

// const test = require('./routes/tests');
require("dotenv").config();

const app = express();
app.use(cors());

// Connect to MongoDB
mongoose
  .connect(config.URI_MONGO, {
    useCreateIndex: true,
    useNewUrlParser: true
  })
  .catch(err => console.log("Error: Could not connect to MongoDB.", err));

mongoose.connection.on("connected", () => {
  console.log("Connected to database");
});
mongoose.connection.on("error", err => {
  console.log("Error: Could not connect to MongoDB.", err);
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
    "GET, POST, OPTIONS, PUT, DELETE"
  );
  next();
});

app.use("/", mainRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/details", detailsRoutes);
app.use("/api/users", userRoutes);
// app.use('/api/tests', test);

module.exports = app;
