const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Voyager = sequelize.define(
  "Voyager",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    passport_number: DataTypes.STRING,
    room_number: DataTypes.STRING,
  },
  {
    tableName: "voyagers",
    timestamps: false,
  }
);

module.exports = Voyager;