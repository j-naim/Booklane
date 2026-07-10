const mongoose = require("mongoose");
require("../models/listing");

const { expressjwt: jwt } = require("express-jwt");

// protect write operations with JWT auth.
const authenticateJWT = jwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
});

const Listing = mongoose.model("listings");

// allowed fields for listings create and update operations.
const LISTING_FIELDS = [
  "code",
  "name",
  "length",
  "start",
  "resort",
  "perPerson",
  "image",
  "description",
];

// keep only the fields that belong in the Listing document.
const extractListingData = (body = {}) => {
  return LISTING_FIELDS.reduce((listingData, field) => {
    if (body[field] !== undefined) {
      listingData[field] = body[field];
    }
    return listingData;
  }, {});
};

// validate listing codes before querying the DB.
const isValidListingCode = (listingCode = "") => {
  return typeof listingCode === "string" && /^[A-Z0-9-]+$/i.test(listingCode.trim());
};

// format schema validation errors into a cleaner array of messages.
const formatValidationErrors = (err) => {
  return Object.values(err.errors || {}).map((error) => error.message);
};

// centralize API error responses for consistent controller output.
const sendListingError = (res, status, message, details = null) => {
  const payload = { message };
  if (details) {
    payload.details = details;
  }
  return res.status(status).json(payload);
};

// GET all listings.
const listingsList = async (req, res) => {
  try {
    const listings = await Listing.find({})
      .sort({ start: 1, name: 1 })
      .lean()
      .exec();

    return res.status(200).json(listings);
  } catch (err) {
    return sendListingError(res, 500, "Unable to retrieve listings", err.message);
  }
};

// GET one listing by code.
const listingsFindByCode = async (req, res) => {
  const listingCode = req.params.listingCode?.trim().toUpperCase();

  if (!isValidListingCode(listingCode)) {
    return sendListingError(res, 400, "A valid listing code is required");
  }

  try {
    const listing = await Listing.findOne({ code: listingCode }).lean().exec();

    if (!listing) {
      return sendListingError(res, 404, "Listing not found");
    }

    return res.status(200).json(listing);
  } catch (err) {
    return sendListingError(res, 500, "Unable to retrieve listing", err.message);
  }
};

// POST create listing.
const listingsAddListing = async (req, res) => {
  const listingData = extractListingData(req.body);

  if (listingData.code) {
    listingData.code = listingData.code.trim().toUpperCase();
  }

  try {
    const listing = await Listing.create(listingData);
    return res.status(201).json(listing);
  } catch (err) {
    if (err.code === 11000) {
      return sendListingError(res, 409, "A listing with that code already exists");
    }

    if (err.name === "ValidationError") {
      return sendListingError(res, 400, "Invalid listing data", formatValidationErrors(err));
    }

    return sendListingError(res, 500, "Unable to create listing", err.message);
  }
};

// PUT update listing.
const listingsUpdateListing = async (req, res) => {
  const listingCode = req.params.listingCode?.trim().toUpperCase();

  if (!isValidListingCode(listingCode)) {
    return sendListingError(res, 400, "A valid listing code is required");
  }

  const updates = extractListingData(req.body);

  if (updates.code) {
    updates.code = updates.code.trim().toUpperCase();
  }

  if (Object.keys(updates).length === 0) {
    return sendListingError(res, 400, "No update fields were provided");
  }

  try {
    const listing = await Listing.findOne({ code: listingCode }).exec();

    if (!listing) {
      return sendListingError(res, 404, "Listing not found");
    }

    // merge the allowed incoming fields into the existing doc.
    Object.assign(listing, updates);

    const updatedListing = await listing.save();
    return res.status(200).json(updatedListing);
  } catch (err) {
    if (err.code === 11000) {
      return sendListingError(res, 409, "A listing with that code already exists");
    }

    if (err.name === "ValidationError") {
      return sendListingError(res, 400, "Invalid listing data", formatValidationErrors(err));
    }

    return sendListingError(res, 500, "Unable to update listing", err.message);
  }
};

// DELETE listing.
const listingsDeleteListing = async (req, res) => {
  const listingCode = req.params.listingCode?.trim().toUpperCase();

  if (!isValidListingCode(listingCode)) {
    return sendListingError(res, 400, "A valid listing code is required");
  }

  try {
    const result = await Listing.deleteOne({ code: listingCode }).exec();

    if (result.deletedCount === 0) {
      return sendListingError(res, 404, "Listing not found");
    }

    return res.status(204).send();
  } catch (err) {
    return sendListingError(res, 500, "Unable to delete listing", err.message);
  }
};

module.exports = {
  authenticateJWT,
  listingsList,
  listingsFindByCode,
  listingsAddListing,
  listingsUpdateListing,
  listingsDeleteListing,
};