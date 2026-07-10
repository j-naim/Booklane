const mongoose = require("mongoose");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

// email pattern for validation.
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// define the user schema for auth. data.
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      index: true,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [emailRegex, "A valid email address is required"],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
    },
    hash: {
      type: String,
      required: true,
    },
    salt: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);


// generate and store a salted password hash instead of plain text.
userSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString("hex");
  this.hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 64, "sha512")
    .toString("hex");
};

// create a signed JWT for auth. users.
userSchema.methods.validPassword = function (password) {
  const hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 64, "sha512")
    .toString("hex");
  return this.hash === hash;
};

userSchema.methods.generateJwt = function () {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 7);

  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      name: this.name,
      exp: parseInt(expiry.getTime() / 1000, 10),
    },
    process.env.JWT_SECRET
  );
};

const User = mongoose.model("users", userSchema);
module.exports = User;