// Render the customer-facing home page.
const index = (req, res) => {
  res.render("index", { title: "Booklane", isHome: true });
};

module.exports = { index };
