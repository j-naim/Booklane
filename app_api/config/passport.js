const passport = require("passport");
const mongoose = require("mongoose");
const LocalStrategy = require("passport-local").Strategy;

require("../models/user");
const User = mongoose.model("users");

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email }).exec();
        if (!user) return done(null, false, { message: "User not found" });

        const isValid = user.validPassword(password);
        if (!isValid) return done(null, false, { message: "Invalid password" });

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);
