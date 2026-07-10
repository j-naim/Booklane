const express = require("express");
const router = express.Router();

const ctrlListings = require("../controllers/listings");
const ctrlAuth = require("../controllers/authentication");

// Public read endpoints, protected write endpoints.
router
  .route("/listings")
  .get(ctrlListings.listingsList)
  .post(ctrlListings.authenticateJWT, ctrlListings.listingsAddListing);

router
  .route("/listings/:listingCode")
  .get(ctrlListings.listingsFindByCode)
  .put(ctrlListings.authenticateJWT, ctrlListings.listingsUpdateListing)
  .delete(ctrlListings.authenticateJWT, ctrlListings.listingsDeleteListing);

// Authentication endpoints.
router.post("/register", ctrlAuth.register);
router.post("/login", ctrlAuth.login);

module.exports = router;

