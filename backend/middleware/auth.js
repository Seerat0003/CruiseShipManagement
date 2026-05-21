const { extractBearerToken, verifyAuthToken } = require("../utils/auth");

const authenticate = (req, res, next) => {
  const authorizationHeader = req.header("Authorization") || req.headers.authorization || "";
  const token = extractBearerToken(authorizationHeader);
  if (!token) return res.status(401).json({ message: "Access Denied. No token provided." });

  try {
    const verified = verifyAuthToken(token);
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
