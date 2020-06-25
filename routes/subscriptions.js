const debug = require("debug")("routes:subscriptions");
const express = require("express");
const config = require("../config");
const router = express.Router();
const Subscriptions = require("../models/subscription");
const User = require("../models/user");
const authController = require("../controllers/auth");
const paymentController = require("../controllers/payment");
const ObjectId = require("mongoose").Types.ObjectId;

const stripe = require("stripe")(config.STRIPE_SECRET, { apiVersion: "" });

router.post(
  "/:email/create-payment-intent",
  authController.accessTokenVerify,
  (req, res, next) => {
    debug("POST /subscriptions/:email/create-payment-intent");
    debug("User email:", req.params.email);
    User.findOne({ email: req.params.email }).then(async user => {
      const now = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setHours(23);
      endDate.setMinutes(59);
      endDate.setSeconds(59);

      const subscription = new Subscriptions({
        _id: new ObjectId(),
        startDate: now,
        endDate: endDate,
        status: "Session creating",
        metadata: { "session-creating": { date: now } },
        userId: user._id
      });
      const sub = await subscription.save();
      const session = await paymentController.createSession(
        user.email,
        sub._id.toString()
      );
      sub.status = "Session created";
      sub.metadata = { ...sub.metadata, "session-created": session };

      await sub.save();
      res.json({ session });
    });
  }
);
router.get("/:email/checkout/:id", async (req, res, next) => {
  const checkout = await stripe.checkout.sessions.retrieve(req.params.id);
  const subscription = await Subscriptions.findOne({
    _id: ObjectId(checkout.metadata.subscription_id)
  });

  const paymentIntent = await stripe.paymentIntents.retrieve(
    checkout.payment_intent
  );
  if (req.query.result === "success" && paymentIntent.status === "succeeded") {
    debug("Payment completed successfully");
    subscription.status = "Payment completed successfully";
    subscription.metadata = {
      ...subscription.metadata,
      "payment-success": paymentIntent
    };
    await subscription.save();

    res.redirect(`${config.UI_URL}/konto/sklep?status=success`);
  } else if (req.query.result === "error") {
    debug("Payment completed with errors:", paymentIntent.status);
    subscription.status =
      "Payment completed with errors:" + paymentIntent.status;
    subscription.metadata = {
      ...subscription.metadata,
      "payment-errors": paymentIntent
    };
  }
  await subscription.save();

  res.redirect(`${config.UI_URL}/konto/sklep?status=error:${paymentIntent.status}`);
});

module.exports = router;
