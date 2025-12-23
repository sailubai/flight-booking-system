const mongoose = require("mongoose");

const flightSchema = new mongoose.Schema({
  flight_id: String,
  airline: String,
  departure_city: String,
  arrival_city: String,
  base_price: Number,
});

module.exports = mongoose.model("Flight", flightSchema);
