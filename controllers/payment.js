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
