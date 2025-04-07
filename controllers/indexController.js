const db = require("../db/queries");

const getMostVisited = async (req, res) => {
  console.log("Getting Most Visited Products");
  res.render("index");
};

module.exports = {
  getMostVisited,
};
