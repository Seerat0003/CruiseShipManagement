const express = require("express");
const cors = require("cors");

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

module.exports = app;
