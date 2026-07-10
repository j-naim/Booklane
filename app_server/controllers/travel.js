const LISTINGS_API_URL = process.env.LISTINGS_API_URL || "http://localhost:3000/api/listings";

// Build a consistent view model for the travel page. 
// This keeps the data shape predictable whether the page loads normally, 
// the database is empty, or the API request fails.

const buildTravelViewModel = (listings = [], message = null) => ({
  title: "Booklane",
  listings,
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
        buildTravelViewModel([], "Listing data is unavailable right now. Please try again later.")
      );
    }

    if (listings.length === 0) {
      return res.render(
        "travel",
        buildTravelViewModel([], "No listings exist in our database.")
      );
    }

    return res.render("travel", buildTravelViewModel(listings));
  } catch (err) {
    console.error("Error loading travel page:", err.message);

    return res.render(
      "travel",
      buildTravelViewModel(
        [],
        "We're having trouble loading listings right now. Please try again later."
      )
    );
  }
};

module.exports = { travel };