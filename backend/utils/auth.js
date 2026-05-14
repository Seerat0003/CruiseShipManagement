const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const JWT_EXPIRES_IN = "1d";

const extractBearerToken = (authorizationHeader = "") => {
  if (!authorizationHeader) {
    return "";
  }

  const [scheme, token] = authorizationHeader.split(" ");
  if (!/^Bearer$/i.test(scheme) || !token) {
    return "";
  }

  return token;
};

const signAuthToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

const verifyAuthToken = (token) => jwt.verify(token, JWT_SECRET);

module.exports = {
  extractBearerToken,
  signAuthToken,
  verifyAuthToken,
  JWT_SECRET,
};
