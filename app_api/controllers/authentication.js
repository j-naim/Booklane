const passport = require("passport");
const User = require("../models/user");

// reuse the same email validation pattern in the auth. controller.
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// centralize auth-related errors.
const sendAuthError = (res, status, message, details = null) => {
  const payload = { message };
  if (details) {
    payload.details = details;
  }
  return res.status(status).json(payload);
};

// apply a simple password length rule before hashing and saving
const passwordIsStrongEnough = (password = "") => {
  return typeof password === "string" && password.length >= 8;
};

// reg. a new user and return a JWT on success.
const register = async (req, res) => {
  const name = req.body.name?.trim() || "";
  const email = req.body.email?.trim().toLowerCase() || "";
  const password = req.body.password || "";

  if (!name || !email || !password) {
    return sendAuthError(res, 400, "All fields required");
  }

  if (!emailRegex.test(email)) {
    return sendAuthError(res, 400, "A valid email address is required");
  }

  if (!passwordIsStrongEnough(password)) {
    return sendAuthError(res, 400, "Password must be at least 8 characters long");
  }

  try {
    const existingUser = await User.findOne({ email }).exec();

    if (existingUser) {
      return sendAuthError(res, 409, "A user with that email already exists");
    }

    const user = new User({ name, email });
    user.setPassword(password);

    await user.save();

    const token = user.generateJwt();
    return res.status(200).json({ token });
  } catch (err) {
    if (err.code === 11000) {
      return sendAuthError(res, 409, "A user with that email already exists");
    }

    if (err.name === "ValidationError") {
      return sendAuthError(
        res,
        400,
        "Invalid registration data",
        Object.values(err.errors || {}).map((error) => error.message)
      );
    }

    return sendAuthError(res, 500, "Unable to register user");
  }
};

// authenticate an existing user and return a JWT if credentials are valid.
const login = (req, res) => {
  const email = req.body.email?.trim().toLowerCase() || "";
  const password = req.body.password || "";

  if (!email || !password) {
    return sendAuthError(res, 400, "All fields required");
  }

  if (!emailRegex.test(email)) {
    return sendAuthError(res, 400, "A valid email address is required");
  }

  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return sendAuthError(res, 500, "Authentication failed");
    }

    if (user) {
      const token = user.generateJwt();
      return res.status(200).json({ token });
    }

    return sendAuthError(res, 401, info?.message || "Invalid email or password");
  })(req, res);
};

module.exports = {
  register,
  login,
};