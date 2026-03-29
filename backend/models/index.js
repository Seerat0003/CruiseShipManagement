const User = require("./user");
const Voyager = require("./voyager");
const Product = require("./product");
const Service = require("./service");
const Booking = require("./booking");
const Cruise = require("./cruise");

// relationships
User.hasOne(Voyager, { foreignKey: "user_id" });
Voyager.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(Booking, { foreignKey: "user_id" });
Booking.belongsTo(User, { foreignKey: "user_id" });

Service.hasMany(Booking, { foreignKey: "service_id" });
Booking.belongsTo(Service, { foreignKey: "service_id" });

Cruise.hasMany(Booking, { foreignKey: "cruise_id" });
Booking.belongsTo(Cruise, { foreignKey: "cruise_id" });

module.exports = {
  User,
  Voyager,
  Product,
  Service,
  Booking,
  Cruise,
};