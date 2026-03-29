const express = require("express");
const nodemailer = require("nodemailer");
const { Product, Service, Booking, Cruise, User } = require("../models");
const { authenticate, authorizeAdmin } = require("../middleware/auth");

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
  try {
    // Include user and service references in bookings
    const bookings = await Booking.findAll({ include: [User, Service, Cruise] });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const userCount = await User.count();
    const cruiseCount = await Cruise.count();
    const servicesCount = await Service.count();
    const bookingCount = await Booking.count();
    
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
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.status = req.body.status;
    await booking.save();

    // DISPATCH AUTOMATIC NOTIFICATION EMAIL ON APPROVAL
    if (booking.status === "Confirmed" && booking.User) {
        nodemailer.createTestAccount((err, account) => {
            if (err) return console.error('Failed to create a testing Mail account', err);
            
            const transporter = nodemailer.createTransport({
                host: account.smtp.host,
                port: account.smtp.port,
                secure: account.smtp.secure,
                auth: { user: account.user, pass: account.pass }
            });
            
            const serviceName = booking.Service ? booking.Service.name : 'Premium Facility';
            const message = {
                from: '"Ocean Serenity Fleet" <noreply@oceanserenity.com>',
                to: booking.User.email,
                subject: `Your Reservation is Confirmed: ${serviceName}`,
                text: `Dear ${booking.User.name},\n\nYour reservation request has been officially approved. \n\nFacility: ${serviceName}\nTime: ${new Date(booking.start_time).toLocaleString()}\n\nWelcome aboard!`,
                html: `
                  <div style="font-family: sans-serif; background: #07101a; padding: 40px; color: #fff; text-align: center;">
                    <h2 style="color: #f7d6a5;">Voyage Reservation Confirmed!</h2>
                    <p style="font-size: 16px;">Dear ${booking.User.name},</p>
                    <p style="font-size: 16px;">Your premium allocation request has been officially <strong>approved</strong> by the Administrator.</p>
                    <div style="background: rgba(255,255,255,0.05); border: 1px solid #f7d6a5; padding: 20px; border-radius: 8px; margin: 30px auto; max-width: 400px; text-align: left;">
                      <p><strong>Facility:</strong> ${serviceName}</p>
                      <p><strong>Scheduled Time:</strong> ${new Date(booking.start_time).toLocaleString()}</p>
                      <p><strong>Status:</strong> <span style="color: #51cf66;">Confirmed</span></p>
                    </div>
                    <p style="color: rgba(255,255,255,0.6); max-width: 500px; margin: 0 auto;">Welcome aboard, and thank you for choosing Ocean Serenity.</p>
                  </div>
                `
            };
            
            transporter.sendMail(message, (err, info) => {
                if (err) return console.error('Email dispatch failed', err.message);
                console.log('--- NOTIFICATION EMAIL DISPATCHED TO VOYAGER ---');
                console.log('Preview Live URL: %s', nodemailer.getTestMessageUrl(info));
            });
        });
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// View registered voyagers
router.get("/users", async (req, res) => {
  try {
    const users = await User.findAll({ where: { role: 'voyager' } });
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
  try {
    const services = await Service.findAll();
    const bookings = await Booking.findAll();
    
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
