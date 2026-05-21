const app = require("./app");
const sequelize = require("./config/db");
const { User } = require("./models");

sequelize
  .authenticate()
  .then(async () => {
    console.log("✅ Database connected");

    // Sync all models (create tables if they don't exist)
    await sequelize.sync({ alter: true });

    // ✅ test query AFTER connection
    const users = await User.findAll();
    console.log("Users:", users);

    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB error:", err);
  });