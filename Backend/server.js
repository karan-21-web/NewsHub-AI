const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();

app.use(cors());

app.get("/news", async (req, res) => {

  try {

    const category = req.query.category || "general";
    const city = req.query.city || "India";

    let query = city;

    if (category !== "general") {
      query += ` ${category}`;
    }

    const url =
      `https://gnews.io/api/v4/search?q=${query}&lang=en&max=10&apikey=${process.env.GNEWS_API_KEY}`;

    const response = await axios.get(url);

    res.json(response.data);

  } catch (error) {

    console.log(error.message);

    res.status(500).json({
      error: "Failed to fetch news"
    });

  }

});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});