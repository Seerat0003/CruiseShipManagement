const express = require("express");
const cors = require("cors");
const sequelize = require("./config/db");
const { User } = require("./models");

// Import routes
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const voyagerRoutes = require("./routes/voyager");
const publicRoutes = require("./routes/public");

const app = express();

app.use(cors());
app.use(express.json());

// Register routes
app.use("/api", authRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/voyager", voyagerRoutes);

app.get("/", (req, res) => {
  res.send("API running");
});

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