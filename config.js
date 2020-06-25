module.exports = {
  // MONGO CONFIG
  URI_MONGO: `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0-cr7xd.mongodb.net/gl-calc?retryWrites=true&w=majority`,
  // PORT APP CONFIG
  PORT_LISTEN: process.env.PORT_LISTEN || 3000,
  // JWT CONFIG
  TOKEN_SECRET_JWT:
    process.env.TOKEN_SECRET_JWT || "jWt9982_s!tokenSecreTqQrtw",
  API_URL: process.env.API_URL || `http://api.gl-calc.docker:3000/api`,
  UI_URL: process.env.UI_URL || `http://gl-calc.docker:8080`,
  APP_NAME: process.env.APP_NAME || `GL calc`,
  MAIL_SERVER_USER: process.env.MAIL_SERVER_USER,
  MAIL_SERVER_PASSWORD: process.env.MAIL_SERVER_PASSWORD,
  STRIPE_SECRET: process.env.STRIPE_SECRET,
  STRIPE_KEY: process.env.STRIPE_KEY
};
