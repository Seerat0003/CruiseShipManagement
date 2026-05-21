const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Booking = sequelize.define(
  "Booking",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    service_id: { type: DataTypes.INTEGER, allowNull: true },
    cruise_id: { type: DataTypes.INTEGER, allowNull: true },
    start_time: DataTypes.DATE,
    end_time: DataTypes.DATE,
    status: DataTypes.STRING,
    // Cruise registration fields
    group_type: { type: DataTypes.STRING, allowNull: true },   // solo | couple | family
    passengers: { type: DataTypes.INTEGER, allowNull: true },
    cabin_type: { type: DataTypes.STRING, allowNull: true },   // Standard | Deluxe | Suite
    rooms: { type: DataTypes.INTEGER, allowNull: true },
    special_requests: { type: DataTypes.TEXT, allowNull: true },
    total_price: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  },
  {
    tableName: "bookings",
    timestamps: false,
  }
);

module.exports = Booking;