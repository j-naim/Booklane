require("dotenv").config();

const fs = require("fs");
const path = require("path");

// Load DB connection and model registration. Order matters: db.js registers schemas, then we can use them.
const mongoose = require("./app_api/models/db");
const Listing = require("./app_api/models/listing");

const SEED_PATH = path.join(__dirname, "data", "listings.json");

const seedDB = async () => {
  console.log(`Seeding from ${SEED_PATH}`);

  if (!fs.existsSync(SEED_PATH)) {
    throw new Error(`Seed file not found at ${SEED_PATH}`);
  }

  const listings = JSON.parse(fs.readFileSync(SEED_PATH, "utf8"));

  if (!Array.isArray(listings) || listings.length === 0) {
    throw new Error("Seed file is empty or not an array");
  }

  // Wait for the connection that db.js initiated.
  await new Promise((resolve, reject) => {
    if (mongoose.connection.readyState === 1) {
      return resolve();
    }
    mongoose.connection.once("connected", resolve);
    mongoose.connection.once("error", reject);
  });

  const deleted = await Listing.deleteMany({});
  console.log(`Removed ${deleted.deletedCount} existing listings`);

  const inserted = await Listing.insertMany(listings);
  console.log(`Inserted ${inserted.length} listings`);
};

seedDB()
  .then(async () => {
    await mongoose.connection.close();
    console.log("Seed complete.");
    process.exit(0);
  })
  .catch(async (err) => {
    console.error("Seed failed:", err.message);
    try {
      await mongoose.connection.close();
    } catch (_) {
      // ignore close errors during failure path
    }
    process.exit(1);
  });