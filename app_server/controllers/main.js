const { fetchListings, toListingCard } = require("../helpers/listings");

// pick the next trip that hasn't departed yet. the API sorts by start date.
const findNextDeparture = (listings) => {
  const now = Date.now();
  return listings.find((listing) => new Date(listing.start).getTime() > now) || null;
};

// render the home page with a live featured trip.
const index = async (_req, res) => {
  let featured = null;

  try {
    const next = findNextDeparture(await fetchListings());
    featured = next ? toListingCard(next) : null;
  } catch (err) {
    // the homepage still renders without the featured trip if the API is down.
    console.error("Error loading featured trip:", err.message);
  }

  res.render("index", { title: "Booklane", isHome: true, featured });
};

module.exports = { index };