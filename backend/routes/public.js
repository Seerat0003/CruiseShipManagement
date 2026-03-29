const express = require("express");
const { Cruise, Service, Booking } = require("../models");

const router = express.Router();

router.get("/cruises", async (req, res) => {
  try {
    const cruises = await Cruise.findAll();
    res.json(cruises);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/services", async (req, res) => {
  try {
    const services = await Service.findAll();
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/bookings", async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      attributes: ['service_id', 'start_time', 'status']
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/bookings", async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      attributes: ['service_id', 'start_time', 'status']
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
