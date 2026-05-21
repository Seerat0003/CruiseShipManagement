const request = require("supertest");
const app = require("../app");
const sequelize = require("../config/db");
const { resetDatabase, seedTestData } = require("./setup");
const jwt = require("jsonwebtoken");
const { Booking, Service, Product, Cruise, User } = require("../models");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

beforeAll(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await sequelize.close();
});

describe("💼 Admin Command Center Tests", () => {
  let adminToken;
  let voyagerToken;
  let voyagerUserObj;
  let spaServiceObj;

  beforeEach(async () => {
    await resetDatabase();
    const { adminUser, voyagerUser, spaService } = await seedTestData();
    voyagerUserObj = voyagerUser;
    spaServiceObj = spaService;

    adminToken = jwt.sign(
      { id: adminUser.id, role: adminUser.role },
      JWT_SECRET
    );

    voyagerToken = jwt.sign(
      { id: voyagerUser.id, role: voyagerUser.role },
      JWT_SECRET
    );
  });

  describe("🔑 Access Control", () => {
    it("should deny admin routes to Voyagers with status 403", async () => {
      const res = await request(app)
        .get("/api/admin/stats")
        .set("Authorization", `Bearer ${voyagerToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty("message", "Access Denied. Admin only.");
    });
  });

  describe("POST /api/admin/items (Create Inventory Items)", () => {
    it("should allow an admin to create a new service", async () => {
      const res = await request(app)
        .post("/api/admin/items")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          type: "service",
          name: "Premium Beauty Salon Extra",
          category: "Beauty",
          price: 99.0
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("message", "Service created");
      expect(res.body.service).toHaveProperty("name", "Premium Beauty Salon Extra");

      // Verify in DB
      const dbService = await Service.findOne({ where: { name: "Premium Beauty Salon Extra" } });
      expect(dbService).not.toBeNull();
    });

    it("should allow an admin to create a new product", async () => {
      const res = await request(app)
        .post("/api/admin/items")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          type: "product",
          name: "Premium Marine Binoculars",
          category: "Recreation Gear",
          price: 180.0,
          stock: 100
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("message", "Product created");
      expect(res.body.product).toHaveProperty("name", "Premium Marine Binoculars");

      // Verify in DB
      const dbProduct = await Product.findOne({ where: { name: "Premium Marine Binoculars" } });
      expect(dbProduct).not.toBeNull();
    });
  });

  describe("PUT /api/admin/bookings/:id (Moderation)", () => {
    it("should allow an admin to approve/confirm a pending booking", async () => {
      // Pre-create booking
      const booking = await Booking.create({
        user_id: voyagerUserObj.id,
        service_id: spaServiceObj.id,
        start_time: new Date("2026-06-15T16:00:00.000Z"),
        end_time: new Date("2026-06-15T19:00:00.000Z"),
        status: "Pending"
      });

      const res = await request(app)
        .put(`/api/admin/bookings/${booking.id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          status: "Confirmed"
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("status", "Confirmed");

      // Verify DB updated
      const dbBooking = await Booking.findByPk(booking.id);
      expect(dbBooking.status).toBe("Confirmed");
    });
  });

  describe("POST /api/admin/cruises (Deploy New Voyage)", () => {
    it("should allow an admin to deploy a new cruise trip", async () => {
      const res = await request(app)
        .post("/api/admin/cruises")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Caribbean Sunset Excursion",
          route: "Miami -> Bahamas -> Jamaica",
          start_date: "2026-07-02",
          duration_days: 5,
          total_seats: 800,
          price: 950.0,
          image_url: "carib_cruise.png"
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("message", "Cruise created");
      expect(res.body.cruise).toHaveProperty("name", "Caribbean Sunset Excursion");

      // Verify in DB
      const dbCruise = await Cruise.findOne({ where: { name: "Caribbean Sunset Excursion" } });
      expect(dbCruise).not.toBeNull();
      expect(dbCruise.available_seats).toBe(800);
    });
  });

  describe("GET /api/admin/stats (System Metrics)", () => {
    it("should return the overall system statistics correctly", async () => {
      const res = await request(app)
        .get("/api/admin/stats")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("users");
      expect(res.body).toHaveProperty("cruises");
      expect(res.body).toHaveProperty("services");
      expect(res.body).toHaveProperty("bookings");
      expect(res.body).toHaveProperty("totalSeats");
      expect(res.body).toHaveProperty("availableSeats");
    });
  });
});
