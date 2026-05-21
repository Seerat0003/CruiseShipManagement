const express = require("express");
const { Booking, User, Service, Cruise } = require("../models");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// Middleware to check if user is manager or admin
const authorizeManagerOrAdmin = (req, res, next) => {
  if (req.user.role === "manager" || req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Managers or Admins only." });
  }
};

router.use(authenticate, authorizeManagerOrAdmin);

// View all bookings for management
router.get("/bookings", async (req, res) => {
  try {
    const { category } = req.query;
    const where = {};
    const include = [User, Service, Cruise];

    if (category) {
      where["$Service.category$"] = category;
    }

    const bookings = await Booking.findAll({ where, include });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
