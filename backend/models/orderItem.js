const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const OrderItem = sequelize.define(
  "OrderItem",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    order_id: DataTypes.INTEGER,
    product_id: DataTypes.INTEGER,
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
  },
  {
    tableName: "order_items",
    timestamps: false,
  }
);

module.exports = OrderItem;
