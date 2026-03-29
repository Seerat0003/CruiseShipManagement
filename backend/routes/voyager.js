const express = require("express");
const { Service, Booking, Product } = require("../models");
const { authenticate, authorizeVoyager } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate, authorizeVoyager);

// Get available services (Salon, Fitness Centre, etc.)
router.get("/services", async (req, res) => {
  try {
    const services = await Service.findAll();
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get available products (Catering, Stationery, etc.)
router.get("/products", async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a booking for a service (Party Hall, Salon, etc.)
router.post("/bookings", async (req, res) => {
  try {
    const { service_id, start_time, end_time } = req.body;
    const user_id = req.user.id;

    const booking = await Booking.create({
      user_id,
      service_id,
      start_time,
      end_time,
      status: "Pending", // Admin must approve
    });

    res.status(201).json({ message: "Booking requested", booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get voyager's own bookings
router.get("/bookings", async (req, res) => {
  try {
    const user_id = req.user.id;
    const bookings = await Booking.findAll({ where: { user_id } });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
