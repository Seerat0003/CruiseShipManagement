const User = require("./user");
const Voyager = require("./voyager");
const Product = require("./product");
const Service = require("./service");
const Booking = require("./booking");
const Cruise = require("./cruise");
const Order = require("./order");
const OrderItem = require("./orderItem");

// relationships
User.hasOne(Voyager, { foreignKey: "user_id" });
Voyager.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(Booking, { foreignKey: "user_id" });
Booking.belongsTo(User, { foreignKey: "user_id" });

Service.hasMany(Booking, { foreignKey: "service_id" });
Booking.belongsTo(Service, { foreignKey: "service_id" });

Cruise.hasMany(Booking, { foreignKey: "cruise_id" });
Booking.belongsTo(Cruise, { foreignKey: "cruise_id" });

User.hasMany(Order, { foreignKey: "user_id" });
Order.belongsTo(User, { foreignKey: "user_id" });

Order.hasMany(OrderItem, { foreignKey: "order_id" });
OrderItem.belongsTo(Order, { foreignKey: "order_id" });

Product.hasMany(OrderItem, { foreignKey: "product_id" });
OrderItem.belongsTo(Product, { foreignKey: "product_id" });

module.exports = {
  User,
  Voyager,
  Product,
  Service,
  Booking,
  Cruise,
  Order,
  OrderItem,
};