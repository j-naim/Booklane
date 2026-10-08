const { fetchListings, toListingCard } = require("../helpers/listings");

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
    const listings = await fetchListings();

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