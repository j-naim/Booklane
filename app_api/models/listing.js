const mongoose = require("mongoose");

// price input - values stored consistently as numbers.
const normalizePrice = (value) => {
  if (typeof value === "string") {
    return Number(value.replace(/[^0-9.]/g, ""));
  }
  return value;
};

// defines the listing schema.
const listingSchema = new mongoose.Schema(
  {
    // listing codes are intended to be unique identifiers for listing records.
    code: {
      type: String,
      required: [true, "Listing code is required"],
      unique: true,
      index: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Z0-9-]+$/, "Listing code format is invalid"],
    },
    name: {
      type: String,
      required: [true, "Listing name is required"],
      index: true,
      trim: true,
      minlength: [3, "Listing name must be at least 3 characters"],
    },
    length: {
      type: String,
      required: [true, "Listing length is required"],
      trim: true,
    },
    start: {
      type: Date,
      required: [true, "Start date is required"],
      validate: {
        validator: (value) => value instanceof Date && !Number.isNaN(value.getTime()),
        message: "Start date must be valid",
      },
    },
    resort: {
      type: String,
      required: [true, "Resort is required"],
      trim: true,
    },
    perPerson: {
      type: Number,
      required: [true, "Price per person is required"],
      min: [0, "Price per person cannot be negative"],
      set: normalizePrice,
    },
    image: {
      type: String,
      required: [true, "Image path is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// support predictable list retrieval and ordering based on date.
listingSchema.index({ start: 1, code: 1 });

const Listing = mongoose.model("listings", listingSchema);
module.exports = Listing;