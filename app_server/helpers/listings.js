// shared helpers for pages that display listings from the API.

const LISTINGS_API_URL = process.env.LISTINGS_API_URL || "http://localhost:3000/api/listings";

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

// dates are stored at midnight UTC so format in UTC to avoid showing the day before.
const formatStartDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "TBD";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
};

// image paths are stored root-relative 
const toImageUrl = (path) => {
  const value = path || "";
  return value.startsWith("/") ? value : `/${value}`;
};

// show just the day count on cards. Falls back to the original if it doesn't match. 
const formatDuration = (length) => {
    const match = String(length || "").match(/(\d+)\s*days?/i);
    if (!match) return length || "";
    return `${match[1]} ${match[1] === "1" ? "day" : "days"}`;
}

// shape a listing for display without changing the API response.
const toListingCard = (listing) => ({
  ...listing,
  imageUrl: toImageUrl(listing.image),
  startFormatted: formatStartDate(listing.start),
  priceFormatted: priceFormatter.format(Number(listing.perPerson) || 0),
  durationFormatted: formatDuration(listing.length),
});

// fetch every listing from the API layer. throws if the API fails or returns something unexpected.
const fetchListings = async () => {
  const response = await fetch(LISTINGS_API_URL, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Listings API returned status ${response.status}`);
  }

  const listings = await response.json();

  if (!Array.isArray(listings)) {
    throw new Error("Listings API returned an unexpected response");
  }

  return listings;
};

module.exports = { fetchListings, toListingCard };