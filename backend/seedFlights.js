const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Flight = require("./models/Flight");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect("mongodb://127.0.0.1:27017/flight_booking")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Test route
app.get("/", (req, res) => {
  res.send("Flight Booking API Running");
});

// ✈️ Flight Search API (Database driven – 10 flights)
app.get("/api/flights", async (req, res) => {
  try {
    const flights = await Flight.find().limit(10);
    res.json(flights);
  } catch (error) {
    res.status(500).json({ message: "Error fetching flights" });
  }
});

// Server start
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
