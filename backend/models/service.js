const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Service = sequelize.define(
  "Service",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: DataTypes.STRING,
    category: DataTypes.STRING,
    price: DataTypes.DECIMAL,
  },
  {
    tableName: "services",
    timestamps: false,
  }
);

module.exports = Service;