require("dotenv").config();

const express = require("express");
const path = require("path");
const hbs = require("hbs");
const passport = require("passport");

require("./app_api/models/db");
require("./app_api/config/passport");

const indexRouter = require("./app_server/routes/index");
const travelRouter = require("./app_server/routes/travel");
const apiRouter = require("./app_api/routes/index");

const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:4200";

// CORS config. for the Angular admin client. 
// Moving the allowed origin into an environment variable 
// makes the app easier to move between local dev. and other environments.
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", CLIENT_URL);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// Parse incoming JSON and URL-encoded form data.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Start Passport before any protected routes are used.
app.use(passport.initialize());

// Config. HBS and register reusable partials.
app.set("views", path.join(__dirname, "app_server", "views"));
app.set("view engine", "hbs");
hbs.registerPartials(path.join(__dirname, "app_server", "views", "partials"));

// Serve static assets without overriding the / route.
app.use(express.static(path.join(__dirname, "public"), { index: false }));

// App routes.
app.use("/", indexRouter);
app.use("/travel", travelRouter);
app.use("/api", apiRouter);

// Return a response for invalid or missing JWTs.
app.use((err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    return res.status(401).json({ message: `${err.name}: ${err.message}` });
  }

  next(err);
});

app.listen(PORT, () => {
  console.log(`Booklane server running at http://localhost:${PORT}`);
});