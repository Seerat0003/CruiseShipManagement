const sequelize = require('./config/db');
const { Cruise, Service, Product, User } = require('./models');
const bcrypt = require('bcryptjs');

async function seed() {
  await sequelize.sync({ alter: true });
  
  // Seed Cruises
  const cCount = await Cruise.count();
  if (cCount === 0) {
    await Cruise.bulkCreate([
      { name: "Mediterranean Voyage", route: "Rome -> Athens -> Istanbul", start_date: new Date('2026-06-15'), duration_days: 7, total_seats: 500, available_seats: 420, price: 1200, image_url: "med_cruise.png" },
      { name: "Caribbean Sunset", route: "Miami -> Bahamas -> Jamaica", start_date: new Date('2026-07-02'), duration_days: 5, total_seats: 800, available_seats: 150, price: 950, image_url: "carib_cruise.png" },
      { name: "Alaskan Glacier Explore", route: "Seattle -> Juneau -> Glacier Bay", start_date: new Date('2026-08-10'), duration_days: 10, total_seats: 300, available_seats: 50, price: 2100, image_url: "alaska_cruise.png" }
    ]);
    console.log("✅ Cruises seeded!");
  } else {
    console.log("🚢 Cruises already exist, skipping.");
  }

  // Seed Services (Spa, Gym, Dining)
  const sCount = await Service.count();
  if (sCount === 0) {
    await Service.bulkCreate([
      { name: "Luxury Spa Treatment", category: "Spa", price: 150 },
      { name: "Fitness Centre Access", category: "Gym", price: 50 },
      { name: "Grand Deck Party Hall", category: "Party", price: 500 },
      { name: "Oceanview Fine Dining", category: "Dining", price: 90 },
      { name: "Onboard Movie Theater", category: "Entertainment", price: 20 },
      { name: "Premium Beauty Salon", category: "Beauty", price: 80 },
      { name: "Elite Gift Boutique", category: "Gifts", price: 100 },
      { name: "Cruise Stationery Set", category: "Stationery", price: 25 },
      { name: "Luxury Brand Retail", category: "Retail", price: 300 },
      { name: "In-Cabin Catering Service", category: "Catering", price: 50 }
    ]);


    console.log("✅ Services seeded!");
  } else {
    console.log("💆 Services already exist, skipping.");
  }

  // Ensure Admin User Exists
  const adminEmail = "admin@cruise.com";
  const existingAdmin = await User.findOne({ where: { email: adminEmail }});
  if (!existingAdmin) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);
    await User.create({ name: "Super Admin", email: adminEmail, password: hashedPassword, role: "admin" });
    console.log("✅ Admin seeded!");
  }

  console.log("🎉 Database seeding fully complete!");
  process.exit();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
