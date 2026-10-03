const LISTINGS_API_URL = process.env.LISTINGS_API_URL || "http://localhost:3000/api/listings";

// format helper
const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

// dates are stored at midnight UTC
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

// image paths -- stored relative to root
const toImageUrl = (path) => {
  const value = path || "";
  return value.startsWith("/") ? value : `/${value}`;
};

// shapes each listing for display w/o changing the API response
const toListingCard = (listing) => ({
  ...listing,
  imageUrl: toImageUrl(listing.image),
  startFormatted: formatStartDate(listing.start),
  priceFormatted: priceFormatter.format(Number(listing.perPerson) || 0),
});

// builds a consistent view model whether the page loads normally, or the db empty
// or the API fails
const buildTravelViewModel = (listings = [], message = null) => ({
  title: "Trips · Booklane",
  isTravel: true,
  listings: listings.map(toListingCard),
  message,
});

// Render the public travel page by requesting listing data from the API layer. 
// The endpoint is environment-based rather than hard-coded directly in the function.
const travel = async (req, res) => {
  try {
    const response = await fetch(LISTINGS_API_URL, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Listings API returned status ${response.status}`);
    }

    const listings = await response.json();

    if (!Array.isArray(listings)) {
      return res.render(
        "travel",
        buildTravelViewModel([], "Trip data is unavailable right now. Please try again later.")
      );
    }

    if (listings.length === 0) {
      return res.render("travel", buildTravelViewModel([], "No trips are available yet. Check back soon."));
    }

    return res.render("travel", buildTravelViewModel(listings));
  } catch (err) {
    console.error("Error loading travel page", err.message);

    return res.render(
      "travel",
      buildTravelViewModel([], "We're having trouble loading trips right now. Please try again later.")
    );
  }
};

module.exports = { travel };