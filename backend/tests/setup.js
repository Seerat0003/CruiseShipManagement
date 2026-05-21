const sequelize = require("../config/db");
const { User, Cruise, Service, Booking } = require("../models");
const bcrypt = require("bcryptjs");

async function resetDatabase() {
  // force: true drops all tables and recreates them
  await sequelize.sync({ force: true });
}

async function seedTestData() {
  // 1. Seed admin
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash("admin123", salt);
  const adminUser = await User.create({
    name: "Test Admin",
    email: "admin@cruise.com",
    password: adminPassword,
    role: "admin",
  });

  // 2. Seed voyager
  const voyagerPassword = await bcrypt.hash("keerti123", salt);
  const voyagerUser = await User.create({
    name: "Keerti",
    email: "keerti123@gmail.com",
    password: voyagerPassword,
    role: "voyager",
  });

  // 3. Seed cruise
  const cruise = await Cruise.create({
    name: "Test Mediterranean Voyage",
    route: "Rome -> Athens -> Istanbul",
    start_date: new Date("2026-06-15"),
    duration_days: 7,
    total_seats: 500,
    available_seats: 420,
    price: 1200.0,
    image_url: "med_cruise.png",
  });

  // 4. Seed services
  const spaService = await Service.create({
    name: "Luxury Spa Treatment",
    category: "Spa",
    price: 150.0,
  });

  const gymService = await Service.create({
    name: "Fitness Centre Access",
    category: "Gym",
    price: 50.0,
  });

  const diningService = await Service.create({
    name: "Grand Deck Party Hall",
    category: "Party",
    price: 500.0,
  });

  return {
    adminUser,
    voyagerUser,
    cruise,
    spaService,
    gymService,
    diningService,
  };
}

module.exports = {
  resetDatabase,
  seedTestData,
};
