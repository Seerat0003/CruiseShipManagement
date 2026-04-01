const express = require("express");
const cors = require("cors");
const http = require("http");
const sequelize = require("./config/db");
const { User } = require("./models");
const { initSocket } = require("./socket");

// Import routes
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const managerRoutes = require("./routes/manager");
const voyagerRoutes = require("./routes/voyager");
const publicRoutes = require("./routes/public");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// Register routes
app.use("/api", authRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/manager", managerRoutes);
app.use("/api/voyager", voyagerRoutes);


app.get("/", (req, res) => {
  res.send("API running with Sockets");
});

// Initialize Socket.io
initSocket(server);

sequelize
  .authenticate()
  .then(async () => {
    console.log("✅ Database connected");

    // Sync all models (create tables if they don't exist)
    await sequelize.sync({ alter: true });

    const PORT = process.env.PORT || 5001;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} with Sockets enabled`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to start backend. Check your PostgreSQL server and backend/.env settings.");
    console.error("❌ DB error:", err);
    process.exit(1);
  });

