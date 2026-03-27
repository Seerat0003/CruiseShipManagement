const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Booking = sequelize.define(
  "Booking",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    start_time: DataTypes.DATE,
    end_time: DataTypes.DATE,
    status: DataTypes.STRING,
  },
  {
    tableName: "bookings",
    timestamps: false,
  }
);

module.exports = Booking;