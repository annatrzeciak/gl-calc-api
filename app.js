const debug = require("debug")("app");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");

const mainRoutes = require("./routes/main");
const productsRoutes = require("./routes/products");
const detailsRoutes = require("./routes/details");
const userRoutes = require("./routes/user");
const calculationsRoutes = require("./routes/calculations");
const subscriptionsRoutes = require("./routes/subscriptions");

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
  .catch(err => debug("Error: Could not connect to MongoDB.", err));

mongoose.connection.on("connected", () => {
  debug("Connected to database");
});
mongoose.connection.on("error", err => {
  debug("Error: Could not connect to MongoDB.", err);
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
app.use("/api/calculations", calculationsRoutes);
app.use("/api/subscriptions", subscriptionsRoutes);
// app.use('/api/tests', test);

module.exports = app;
