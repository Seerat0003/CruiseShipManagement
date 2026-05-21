const express = require("express");
const { Product, Service, Booking, Cruise, User } = require("../models");
const { authenticate, authorizeAdmin } = require("../middleware/auth");
const { sendBookingApprovedEmail } = require("../utils/mailer");

const router = express.Router();

router.use(authenticate, authorizeAdmin);

// Add new product/service
router.post("/items", async (req, res) => {
  try {
    const { type, name, category, price, stock } = req.body;
    
    if (type === "product") {
      const product = await Product.create({ name, category, price, stock });
      return res.status(201).json({ message: "Product created", product });
    } else if (type === "service") {
      const service = await Service.create({ name, category, price });
      return res.status(201).json({ message: "Service created", service });
    } else {
      return res.status(400).json({ message: "Invalid type. Must be 'product' or 'service'." });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a product
router.put("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, stock } = req.body;
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    await product.update({ name, category, price, stock });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a product
router.delete("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    await product.destroy();
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a service
router.put("/services/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { name, category, price } = req.body;
      const service = await Service.findByPk(id);
      if (!service) return res.status(404).json({ message: "Service not found" });
  
      await service.update({ name, category, price });
      res.json(service);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});
  
// Delete a service
router.delete("/services/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const service = await Service.findByPk(id);
        if (!service) return res.status(404).json({ message: "Service not found" });

        await service.destroy();
        res.json({ message: "Service deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// View all bookings
router.get("/bookings", async (req, res) => {
  console.log("DEBUG: GET /api/admin/bookings called");
  try {
    // Include user and service references in bookings
    const bookings = await Booking.findAll({ include: [User, Service, Cruise] });
    console.log(`DEBUG: Found ${bookings.length} bookings`);
    res.json(bookings);
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/stats", async (req, res) => {
  console.log("DEBUG: GET /api/admin/stats called");
  try {
    const userCount = await User.count();
    const cruiseCount = await Cruise.count();
    const servicesCount = await Service.count();
    const bookingCount = await Booking.count();
    console.log(`DEBUG: Stats - Users: ${userCount}, Cruises: ${cruiseCount}, Services: ${servicesCount}, Bookings: ${bookingCount}`);
    
    // Total seats
    const allCruises = await Cruise.findAll();
    let totalSeats = 0;
    let availableSeats = 0;
    allCruises.forEach(c => {
      totalSeats += parseInt(c.total_seats) || 0;
      availableSeats += parseInt(c.available_seats) || 0;
    });

    res.json({
      users: userCount,
      cruises: cruiseCount,
      services: servicesCount,
      bookings: bookingCount,
      totalSeats,
      bookedSeats: totalSeats - availableSeats,
      availableSeats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update booking status
router.put("/bookings/:id", async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
        include: [User, Service]
    });
    const previousStatus = booking.status;
    booking.status = req.body.status;
    await booking.save();

    // --- REAL-TIME SOCKET NOTIFICATION ---
    try {
      const { getIO } = require("../socket");
      const io = getIO();
      if (io) {
        io.to(`user-room-${booking.user_id}`).emit("booking_status_update", {
          message: `Your booking for ${booking.Service?.name || 'Service'} has been ${booking.status}!`,
          status: booking.status
        });
      }
    } catch (err) {
      console.error("Socket emit error on booking update:", err);
    }

    if (booking.status === "Confirmed" && previousStatus !== "Confirmed" && booking.User) {
      try {
        await sendBookingApprovedEmail(booking);
      } catch (emailError) {
        console.error("Email dispatch failed", emailError.message);
      }
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// View registered voyagers
router.get("/users", async (req, res) => {
  console.log("DEBUG: GET /api/admin/users called");
  try {
    const users = await User.findAll({ where: { role: 'voyager' } });
    console.log(`DEBUG: Found ${users.length} voyagers`);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new active trip (cruise)
router.post("/cruises", async (req, res) => {
  try {
    const { name, route, start_date, duration_days, total_seats, price, image_url } = req.body;
    const cruise = await Cruise.create({ 
      name, 
      route, 
      start_date, 
      duration_days, 
      total_seats, 
      available_seats: total_seats, 
      price, 
      image_url 
    });
    res.status(201).json({ message: "Cruise created", cruise });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// View Facility & Location booking stats
router.get("/facility-stats", async (req, res) => {
  console.log("DEBUG: GET /api/admin/facility-stats called");
  try {
    const services = await Service.findAll();
    const bookings = await Booking.findAll();
    console.log(`DEBUG: Processing stats for ${services.length} services and ${bookings.length} total bookings`);
    
    const stats = services.map(srv => {
      const srvBookings = bookings.filter(b => b.service_id === srv.id);
      return {
        id: srv.id,
        name: srv.name,
        category: srv.category,
        total_bookings: srvBookings.length,
        confirmed: srvBookings.filter(b => b.status === 'Confirmed').length,
        pending: srvBookings.filter(b => b.status === 'Pending').length
      };
    });
    
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
