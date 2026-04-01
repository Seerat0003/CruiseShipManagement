const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { Op } = require("sequelize");
const {
  User,
  Service,
  Booking,
  Cruise,
  Voyager,
  Product,
  Order,
  OrderItem,
} = require("../models");
const { getIO } = require("../socket");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

const getServiceCapacity = (category = "") => {
  const normalized = category.toLowerCase();

  if (["gym", "fitness", "sports", "entertainment", "movie", "cinema", "resort"].includes(normalized)) {
    return 50;
  }

  if (["dining", "catering", "food"].includes(normalized)) {
    return 20;
  }

  return 1;
};

const requireAuth = (user) => {
  if (!user) {
    throw new Error("Not authenticated");
  }
};

const requireRole = (user, roles) => {
  requireAuth(user);
  if (!roles.includes(user.role)) {
    throw new Error("Unauthorized");
  }
};

const normalizeFloat = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  return Number.parseFloat(value);
};

const normalizeDate = (value) => {
  if (!value) {
    return null;
  }

  const dateValue = value instanceof Date ? value : new Date(value);
  return Number.isNaN(dateValue.getTime()) ? null : dateValue.toISOString();
};

const fetchBookingWithRelations = (id) =>
  Booking.findByPk(id, {
    include: [User, Service, Cruise],
  });

const sendBookingStatusNotification = async (booking) => {
  try {
    const io = getIO();
    io.to(`user-room-${booking.user_id}`).emit("booking_status_update", {
      message: `Your booking for ${booking.Service?.name || "Service"} has been ${booking.status}!`,
      status: booking.status,
    });
  } catch (error) {
    console.error("Socket emit error on booking update:", error);
  }

  if (booking.status !== "Confirmed" || !booking.User) {
    return;
  }

  try {
    const account = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: account.smtp.host,
      port: account.smtp.port,
      secure: account.smtp.secure,
      auth: {
        user: account.user,
        pass: account.pass,
      },
    });

    const serviceName = booking.Service ? booking.Service.name : "Premium Facility";
    const info = await transporter.sendMail({
      from: '"Ocean Serenity Fleet" <noreply@oceanserenity.com>',
      to: booking.User.email,
      subject: `Your Reservation is Confirmed: ${serviceName}`,
      text: `Dear ${booking.User.name},\n\nYour reservation request has been officially approved.\n\nFacility: ${serviceName}\nTime: ${new Date(booking.start_time).toLocaleString()}\n\nWelcome aboard!`,
      html: `
        <div style="font-family: sans-serif; background: #07101a; padding: 40px; color: #fff; text-align: center;">
          <h2 style="color: #f7d6a5;">Voyage Reservation Confirmed!</h2>
          <p style="font-size: 16px;">Dear ${booking.User.name},</p>
          <p style="font-size: 16px;">Your premium allocation request has been officially <strong>approved</strong> by the Administrator.</p>
          <div style="background: rgba(255,255,255,0.05); border: 1px solid #f7d6a5; padding: 20px; border-radius: 8px; margin: 30px auto; max-width: 400px; text-align: left;">
            <p><strong>Facility:</strong> ${serviceName}</p>
            <p><strong>Scheduled Time:</strong> ${new Date(booking.start_time).toLocaleString()}</p>
            <p><strong>Status:</strong> <span style="color: #51cf66;">Confirmed</span></p>
          </div>
          <p style="color: rgba(255,255,255,0.6); max-width: 500px; margin: 0 auto;">Welcome aboard, and thank you for choosing Ocean Serenity.</p>
        </div>
      `,
    });

    console.log("Preview Live URL:", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Email dispatch failed", error.message);
  }
};

const resolvers = {
  Query: {
    users: async (_, __, { user }) => {
      requireRole(user, ["admin"]);
      return User.findAll({
        include: [Voyager, Booking],
        order: [["id", "ASC"]],
      });
    },
    voyagers: async (_, __, { user }) => {
      requireRole(user, ["admin"]);
      return User.findAll({
        where: { role: "voyager" },
        order: [["id", "ASC"]],
      });
    },
    user: async (_, { id }, { user }) => {
      requireAuth(user);
      if (user.role !== "admin" && user.id !== Number.parseInt(id, 10)) {
        throw new Error("Unauthorized");
      }

      return User.findByPk(id, { include: [Voyager, Booking] });
    },
    me: async (_, __, { user }) => {
      if (!user) {
        return null;
      }

      return User.findByPk(user.id, { include: [Voyager, Booking, Order] });
    },

    services: async (_, { category }) => {
      const where = category ? { category } : undefined;
      return Service.findAll({
        where,
        order: [["name", "ASC"]],
      });
    },
    service: async (_, { id }) => Service.findByPk(id, { include: [Booking] }),

    products: async (_, { category }) => {
      const where = category ? { category } : undefined;
      return Product.findAll({
        where,
        order: [["name", "ASC"]],
      });
    },
    product: async (_, { id }) => Product.findByPk(id),
    productsByCategory: async (_, { category }) => Product.findAll({ where: { category } }),

    bookings: async (_, { category, mine }, { user }) => {
      const where = {};

      if (mine) {
        requireAuth(user);
        where.user_id = user.id;
      } else if (user && user.role === "voyager") {
        where.user_id = user.id;
      }

      const results = await Booking.findAll({
        where,
        include: [User, Service, Cruise],
        order: [["start_time", "ASC"]],
      });

      if (!category) {
        return results;
      }

      return results.filter((booking) => booking.Service?.category === category);
    },
    booking: async (_, { id }, { user }) => {
      const booking = await fetchBookingWithRelations(id);

      if (!booking) {
        return null;
      }

      if (!user) {
        throw new Error("Unauthorized");
      }

      if (user.role === "admin" || user.role === "manager" || user.id === booking.user_id) {
        return booking;
      }

      throw new Error("Unauthorized");
    },

    cruises: async () =>
      Cruise.findAll({
        include: [Booking],
        order: [["start_date", "ASC"]],
      }),
    cruise: async (_, { id }) => Cruise.findByPk(id, { include: [Booking] }),

    adminStats: async (_, __, { user }) => {
      requireRole(user, ["admin"]);

      const [userCount, cruiseCount, servicesCount, bookingCount, allCruises] = await Promise.all([
        User.count({ where: { role: "voyager" } }),
        Cruise.count(),
        Service.count(),
        Booking.count(),
        Cruise.findAll(),
      ]);

      let totalSeats = 0;
      let availableSeats = 0;

      allCruises.forEach((cruise) => {
        totalSeats += Number.parseInt(cruise.total_seats, 10) || 0;
        availableSeats += Number.parseInt(cruise.available_seats, 10) || 0;
      });

      return {
        users: userCount,
        cruises: cruiseCount,
        services: servicesCount,
        bookings: bookingCount,
        totalSeats,
        bookedSeats: totalSeats - availableSeats,
        availableSeats,
      };
    },
    facilityStats: async (_, __, { user }) => {
      requireRole(user, ["admin"]);

      const [services, bookings] = await Promise.all([Service.findAll(), Booking.findAll()]);

      return services.map((service) => {
        const serviceBookings = bookings.filter((booking) => booking.service_id === service.id);
        return {
          id: service.id,
          name: service.name,
          category: service.category,
          total_bookings: serviceBookings.length,
          confirmed: serviceBookings.filter((booking) => booking.status === "Confirmed").length,
          pending: serviceBookings.filter((booking) => booking.status === "Pending").length,
        };
      });
    },

    orders: async (_, __, { user }) => {
      requireRole(user, ["admin"]);
      return Order.findAll({
        include: [User, { model: OrderItem, include: [Product] }],
        order: [["created_at", "DESC"]],
      });
    },
    order: async (_, { id }, { user }) => {
      const order = await Order.findByPk(id, {
        include: [User, { model: OrderItem, include: [Product] }],
      });

      if (!order) {
        return null;
      }

      requireAuth(user);
      if (user.role !== "admin" && user.id !== order.user_id) {
        throw new Error("Unauthorized");
      }

      return order;
    },
    myOrders: async (_, __, { user }) => {
      requireAuth(user);
      return Order.findAll({
        where: { user_id: user.id },
        include: [{ model: OrderItem, include: [Product] }],
        order: [["created_at", "DESC"]],
      });
    },
  },

  Mutation: {
    register: async (_, { name, email, password, phone, role }) => {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new Error("Email already exists");
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await User.create({
        name,
        email,
        phone,
        password: hashedPassword,
        role: role || "voyager",
      });

      return {
        message: "User registered successfully",
        user,
      };
    },
    login: async (_, { email, password }) => {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        throw new Error("Invalid email or password");
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        throw new Error("Invalid email or password");
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: "1d" }
      );

      return {
        message: "Logged in successfully",
        token,
        user,
      };
    },

    createBooking: async (_, { service_id, cruise_id, start_time, end_time }, { user }) => {
      requireAuth(user);

      if (!service_id && !cruise_id) {
        throw new Error("A service or cruise must be selected");
      }

      if (service_id) {
        const service = await Service.findByPk(service_id);
        if (!service) {
          throw new Error("Service not found");
        }

        const capacity = getServiceCapacity(service.category);
        const existingCount = await Booking.count({
          where: {
            service_id,
            start_time,
            status: {
              [Op.ne]: "Cancelled",
            },
          },
        });

        if (existingCount >= capacity) {
          throw new Error("This time slot is fully booked");
        }
      }

      if (cruise_id) {
        const cruise = await Cruise.findByPk(cruise_id);
        if (!cruise) {
          throw new Error("Cruise not found");
        }
      }

      const booking = await Booking.create({
        user_id: user.id,
        service_id,
        cruise_id,
        start_time,
        end_time,
        status: "Pending",
      });

      try {
        const io = getIO();
        io.to("manager-room").emit("new_booking", {
          message: "A new booking has been requested!",
          booking,
        });
        io.to(`user-room-${booking.user_id}`).emit("booking_requested", {
          message: "Your reservation request has been submitted and is awaiting approval.",
          bookingId: booking.id,
          status: booking.status,
        });
      } catch (error) {
        console.error("Socket emit error on booking create:", error);
      }

      return fetchBookingWithRelations(booking.id);
    },
    updateBookingStatus: async (_, { id, status }, { user }) => {
      requireRole(user, ["admin", "manager"]);

      const booking = await fetchBookingWithRelations(id);
      if (!booking) {
        throw new Error("Booking not found");
      }

      await booking.update({ status });
      const updatedBooking = await fetchBookingWithRelations(id);
      await sendBookingStatusNotification(updatedBooking);
      return updatedBooking;
    },
    cancelBooking: async (_, { id }, { user }) => {
      requireAuth(user);

      const booking = await Booking.findByPk(id);
      if (!booking) {
        throw new Error("Booking not found");
      }

      if (user.role !== "admin" && user.id !== booking.user_id) {
        throw new Error("Unauthorized");
      }

      await booking.update({ status: "Cancelled" });
      return fetchBookingWithRelations(id);
    },

    placeOrder: async (_, { items }, { user }) => {
      requireAuth(user);

      let total = 0;
      const orderItemsData = [];

      for (const item of items) {
        const product = await Product.findByPk(item.product_id);
        if (!product) {
          throw new Error(`Product with ID ${item.product_id} not found`);
        }
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product ${product.name}`);
        }

        total += Number.parseFloat(product.price) * item.quantity;
        orderItemsData.push({
          product_id: item.product_id,
          quantity: item.quantity,
        });

        await product.update({ stock: product.stock - item.quantity });
      }

      const order = await Order.create({
        user_id: user.id,
        total,
        created_at: new Date(),
      });

      for (const itemData of orderItemsData) {
        await OrderItem.create({
          order_id: order.id,
          ...itemData,
        });
      }

      return Order.findByPk(order.id, {
        include: [User, { model: OrderItem, include: [Product] }],
      });
    },

    createCruise: async (_, args, { user }) => {
      requireRole(user, ["admin"]);

      return Cruise.create({
        ...args,
        available_seats: args.total_seats,
      });
    },
    updateCruise: async (_, { id, ...args }, { user }) => {
      requireRole(user, ["admin"]);

      const cruise = await Cruise.findByPk(id);
      if (!cruise) {
        throw new Error("Cruise not found");
      }

      await cruise.update(args);
      return cruise;
    },
    deleteCruise: async (_, { id }, { user }) => {
      requireRole(user, ["admin"]);

      const cruise = await Cruise.findByPk(id);
      if (!cruise) {
        throw new Error("Cruise not found");
      }

      await cruise.destroy();
      return true;
    },

    createProduct: async (_, { name, category, price, stock }, { user }) => {
      requireRole(user, ["admin"]);

      return Product.create({
        name,
        category,
        price,
        stock,
      });
    },
    updateProduct: async (_, { id, ...args }, { user }) => {
      requireRole(user, ["admin"]);

      const product = await Product.findByPk(id);
      if (!product) {
        throw new Error("Product not found");
      }

      await product.update(args);
      return product;
    },
    updateProductStock: async (_, { id, stock }, { user }) => {
      requireRole(user, ["admin", "manager"]);

      const product = await Product.findByPk(id);
      if (!product) {
        throw new Error("Product not found");
      }

      await product.update({ stock });
      return product;
    },
    deleteProduct: async (_, { id }, { user }) => {
      requireRole(user, ["admin"]);

      const product = await Product.findByPk(id);
      if (!product) {
        throw new Error("Product not found");
      }

      await product.destroy();
      return true;
    },

    updateService: async (_, { id, ...args }, { user }) => {
      requireRole(user, ["admin"]);

      const service = await Service.findByPk(id);
      if (!service) {
        throw new Error("Service not found");
      }

      await service.update(args);
      return service;
    },
    deleteService: async (_, { id }, { user }) => {
      requireRole(user, ["admin"]);

      const service = await Service.findByPk(id);
      if (!service) {
        throw new Error("Service not found");
      }

      await service.destroy();
      return true;
    },

    updateMyProfile: async (_, { name, email }, { user }) => {
      requireAuth(user);

      const dbUser = await User.findByPk(user.id);
      if (!dbUser) {
        throw new Error("User not found");
      }

      await dbUser.update({ name, email });
      return dbUser;
    },
  },

  User: {
    createdAt: async (user) => user.createdAt || user.created_at || null,
    voyager: async (user) => Voyager.findOne({ where: { user_id: user.id } }),
    bookings: async (user) =>
      Booking.findAll({
        where: { user_id: user.id },
        order: [["start_time", "ASC"]],
      }),
    orders: async (user) =>
      Order.findAll({
        where: { user_id: user.id },
        order: [["created_at", "DESC"]],
      }),
  },
  Voyager: {
    user: async (voyager) => User.findByPk(voyager.user_id),
  },
  Product: {
    price: (product) => normalizeFloat(product.price),
  },
  Service: {
    price: (service) => normalizeFloat(service.price),
    capacity: (service) => getServiceCapacity(service.category),
    bookings: async (service) =>
      Booking.findAll({
        where: { service_id: service.id },
        order: [["start_time", "ASC"]],
      }),
  },
  Cruise: {
    start_date: (cruise) => normalizeDate(cruise.start_date),
    price: (cruise) => normalizeFloat(cruise.price),
    bookings: async (cruise) =>
      Booking.findAll({
        where: { cruise_id: cruise.id },
        order: [["start_time", "ASC"]],
      }),
  },
  Booking: {
    start_time: (booking) => normalizeDate(booking.start_time),
    end_time: (booking) => normalizeDate(booking.end_time),
    user: async (booking) => User.findByPk(booking.user_id),
    service: async (booking) => {
      if (!booking.service_id) {
        return null;
      }
      return Service.findByPk(booking.service_id);
    },
    cruise: async (booking) => {
      if (!booking.cruise_id) {
        return null;
      }
      return Cruise.findByPk(booking.cruise_id);
    },
  },
  Order: {
    created_at: (order) => normalizeDate(order.created_at),
    total: (order) => normalizeFloat(order.total),
    user: async (order) => User.findByPk(order.user_id),
    items: async (order) =>
      OrderItem.findAll({
        where: { order_id: order.id },
        include: [Product],
      }),
  },
  OrderItem: {
    product: async (item) => Product.findByPk(item.product_id),
  },
};

module.exports = resolvers;
