const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: DataTypes.INTEGER,
    total: DataTypes.DECIMAL(10, 2),
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: "orders",
    timestamps: false,
  }
);

module.exports = Order;
