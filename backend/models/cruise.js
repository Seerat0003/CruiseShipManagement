const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Cruise = sequelize.define(
  "Cruise",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: DataTypes.STRING,
    route: DataTypes.STRING,
    start_date: DataTypes.DATE,
    duration_days: DataTypes.INTEGER,
    total_seats: DataTypes.INTEGER,
    available_seats: DataTypes.INTEGER,
    price: DataTypes.DECIMAL,
    image_url: DataTypes.STRING,
  },
  {
    tableName: "cruises",
    timestamps: false,
  }
);

module.exports = Cruise;
