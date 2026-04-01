const path = require("path");
const { Sequelize } = require("sequelize");
<<<<<<< Updated upstream

require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });
=======
require("dotenv").config({ path: "./.env" });
>>>>>>> Stashed changes

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    port: process.env.DB_PORT,
    logging: false,
  }
);

module.exports = sequelize;
