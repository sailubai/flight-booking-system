const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

// -------------------- MongoDB Connection --------------------
// ✅ FIXED: removed deprecated options
mongoose.connect("mongodb://127.0.0.1:27017/flightDB")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// -------------------- Flight Schema --------------------
const flightSchema = new mongoose.Schema({
  flight_id: String,
  airline: String,
  departure_city: String,
  arrival_city: String,
  base_price: Number,
});

const Flight = mongoose.model("Flight", flightSchema);

// -------------------- Attempt Tracker --------------------
const attemptCount = {};

// -------------------- Wallet --------------------
let wallet = {
  balance: 5000
};

// -------------------- APIs --------------------

// 1️⃣ Get all flights (with dynamic pricing)
app.get("/api/flights", async (req, res) => {
  const flights = await Flight.find();

  const result = flights.map(flight => {
    if (!attemptCount[flight.flight_id]) {
      attemptCount[flight.flight_id] = 0;
    }

    attemptCount[flight.flight_id]++;

    let finalPrice = flight.base_price;
    if (attemptCount[flight.flight_id] > 3) {
      finalPrice = Math.round(flight.base_price * 1.1);
    }

    return {
      flight_id: flight.flight_id,
      airline: flight.airline,
      departure_city: flight.departure_city,
      arrival_city: flight.arrival_city,
      base_price: flight.base_price,
      final_price: finalPrice
    };
  });

  res.json(result);
});

// 2️⃣ Get wallet balance
app.get("/api/wallet", (req, res) => {
  res.json({
    balance: wallet.balance
  });
});

// 3️⃣ Book a flight
app.post("/api/book/:flightId", async (req, res) => {
  const flightId = req.params.flightId;

  const flight = await Flight.findOne({ flight_id: flightId });
  if (!flight) {
    return res.status(404).json({ message: "Flight not found" });
  }

  let attempts = attemptCount[flightId] || 1;
  let price = flight.base_price;

  if (attempts > 3) {
    price = Math.round(price * 1.1);
  }

  if (wallet.balance < price) {
    return res.status(400).json({
      message: "Insufficient wallet balance"
    });
  }

  wallet.balance -= price;

  res.json({
    message: "Flight booked successfully",
    flight_id: flight.flight_id,
    price_paid: price,
    remaining_balance: wallet.balance
  });
});

// -------------------- Server --------------------
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Flight Booking API running on port ${PORT}`);
});
