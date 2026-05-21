const path = require("path");
const { Sequelize } = require("sequelize");


require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });


const dbName = process.env.NODE_ENV === "test" ? "cruisemanagement_test" : process.env.DB_NAME;

const sequelize = new Sequelize(
  dbName,
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
