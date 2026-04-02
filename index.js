const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./src/config/connectDB");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Routes
app.get("/", (req, res) => {
  res.send("Finance Data API");
});

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
