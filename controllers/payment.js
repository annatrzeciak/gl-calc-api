const debug = require("debug")("controller:payment");
const config = require("../config");
const Subscription = require("../models/subscription");
const stripe = require("stripe")(config.STRIPE_SECRET, { apiVersion: "" });

exports.createSession = async (email, subscriptionId) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price: "price_1GxcisJ17l3GVL1flKFyoGJs",
        quantity: 1
      }
    ],
    metadata: {
      subscription_id: subscriptionId
    },

    customer_email: email,
    mode: "payment",
    success_url: `${config.API_URL}/subscriptions/${email}/checkout/{CHECKOUT_SESSION_ID}?result=success`,
    cancel_url: `${config.API_URL}/subscriptions/${email}/checkout/{CHECKOUT_SESSION_ID}?result=error`
  });
  debug("Created session:", session.id);
  return session;
};

exports.getUserSubscriptions = async (res, user) => {
  return new Promise(resolve => {
    Subscription.find({ userId: user._id }).then(subscriptions => {
      resolve(subscriptions);
    });
  });
};

exports.checkThatUserHasActiveSubscription = async user => {
  return new Promise(resolve => {
    Subscription.find({
      userId: user._id,
      status: "Payment completed successfully"
    }).then(subscriptions => {
      if (subscriptions.length) {
        const checkSubscriptions = async () =>
          new Promise(resolve => {
            subscriptions.map((sub, i) => {
              if (sub.endDate.getTime() < new Date().getTime()) {
                debug("Update status to: 'Subscription expired', id:", sub._id);
                sub.status = "Subscription expired";
                sub.save();
              }
              if (i === subscriptions.length - 1) {
                resolve(subscriptions);
              }
            });
          });
        checkSubscriptions().then(subscriptions => {
          resolve(
            subscriptions
              .filter(sub => sub.status === "Payment completed successfully")
              .map(sub => ({
                id: sub._id,
                endDate: sub.endDate
              }))
          );
        });
      } else {
        resolve(subscriptions);
      }
    });
  });
};
