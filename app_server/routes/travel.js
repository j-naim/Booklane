const express = require("express");
const router = express.Router();

const ctrlTravel = require("../controllers/travel");

// Keep routing separate from page logic so the controller owns the data lookup 
// and view rendering.
router.get("/", ctrlTravel.travel);

module.exports = router;
