module.exports = {
  // MONGO CONFIG
  URI_MONGO: `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0-cr7xd.mongodb.net/gl-calc?retryWrites=true&w=majority`,
  // PORT APP CONFIG
  PORT_LISTEN: process.env.PORT_LISTEN || 3000,
  // JWT CONFIG
  TOKEN_SECRET_JWT: process.env.TOKEN_SECRET_JWT || 'jWt9982_s!tokenSecreTqQrtw'
};
