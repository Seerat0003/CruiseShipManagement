const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "Access Denied. No token provided." });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || "supersecretkey");
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid Token" });
  }
};

const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Access Denied. Admin only." });
  }
};

const authorizeVoyager = (req, res, next) => {
  if (req.user && req.user.role === "voyager") {
    next();
  } else {
    res.status(403).json({ message: "Access Denied. Voyager only." });
  }
};

module.exports = { authenticate, authorizeAdmin, authorizeVoyager };
