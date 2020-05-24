const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true
    },
    password: {
      type: String,
      trim: true,
      required: true,
      select: false
    },
    role: {
      type: String,
      trim: true,
      default: "USER"
    },
    emailConfirmed: {
      type: Boolean,
      default: false
    }
  },
  {
    versionKey: false
  }
);

userSchema.pre("save", function(next) {
  if (this.password !== undefined)
    this.password = bcrypt.hashSync(this.password, saltRounds);
  next();
});

module.exports = mongoose.model("User", userSchema);
