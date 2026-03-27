const express = require("express");
const sequelize = require("./config/db");
const { User } = require("./models");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API running");
});

sequelize
  .authenticate()
  .then(async () => {
    console.log("✅ Database connected");

    // ✅ test query AFTER connection
    const users = await User.findAll();
    console.log("Users:", users);

    app.listen(5000, () => {
      console.log("🚀 Server running on port 5000");
    });
  })
  .catch((err) => {
    console.error("❌ DB error:", err);
  });