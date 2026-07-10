const express = require("express");
const router = express.Router();

const ctrlMain = require("../controllers/main");

// Keep the route layer thin by assigning rendering to the controller.
router.get("/", ctrlMain.index);

module.exports = router;
