const request = require("supertest");
const app = require("../app");
const sequelize = require("../config/db");
const { resetDatabase, seedTestData } = require("./setup");
const jwt = require("jsonwebtoken");
const { Booking } = require("../models");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

beforeAll(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await sequelize.close();
});

describe("🚢 Voyager API Tests", () => {
  let voyagerToken;
  let adminToken;
  let voyagerUserObj;
  let spaServiceObj;

  beforeEach(async () => {
    await resetDatabase();
    const { voyagerUser, adminUser, spaService } = await seedTestData();
    voyagerUserObj = voyagerUser;
    spaServiceObj = spaService;

    voyagerToken = jwt.sign(
      { id: voyagerUser.id, role: voyagerUser.role },
      JWT_SECRET
    );

    adminToken = jwt.sign(
      { id: adminUser.id, role: adminUser.role },
      JWT_SECRET
    );
  });

  describe("GET /api/voyager/services", () => {
    it("should allow a voyager to retrieve services", async () => {
      const res = await request(app)
        .get("/api/voyager/services")
        .set("Authorization", `Bearer ${voyagerToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(3);
    });

    it("should deny access to regular users with no token", async () => {
      const res = await request(app).get("/api/voyager/services");
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("message", "Access Denied. No token provided.");
    });

    it("should deny access to non-voyager roles (e.g. Admin)", async () => {
      const res = await request(app)
        .get("/api/voyager/services")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty("message", "Access Denied. Voyager only.");
    });
  });

  describe("POST /api/voyager/bookings", () => {
    it("should successfully request a new premium service slot booking", async () => {
      const startTime = new Date("2026-06-15T16:00:00.000Z");
      const endTime = new Date("2026-06-15T19:00:00.000Z");

      const res = await request(app)
        .post("/api/voyager/bookings")
        .set("Authorization", `Bearer ${voyagerToken}`)
        .send({
          service_id: spaServiceObj.id,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("message", "Booking requested");
      expect(res.body).toHaveProperty("booking");
      expect(res.body.booking).toHaveProperty("status", "Pending");
      expect(res.body.booking).toHaveProperty("service_id", spaServiceObj.id);
      expect(res.body.booking).toHaveProperty("user_id", voyagerUserObj.id);

      // Verify DB storage
      const dbBooking = await Booking.findByPk(res.body.booking.id);
      expect(dbBooking).not.toBeNull();
      expect(dbBooking.status).toBe("Pending");
    });
  });

  describe("GET /api/voyager/bookings", () => {
    it("should return the voyager's personal itineraries only", async () => {
      const startTime = new Date("2026-06-15T16:00:00.000Z");
      const endTime = new Date("2026-06-15T19:00:00.000Z");

      // Precreate a booking
      await Booking.create({
        user_id: voyagerUserObj.id,
        service_id: spaServiceObj.id,
        start_time: startTime,
        end_time: endTime,
        status: "Pending",
      });

      const res = await request(app)
        .get("/api/voyager/bookings")
        .set("Authorization", `Bearer ${voyagerToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0]).toHaveProperty("service_id", spaServiceObj.id);
      expect(res.body[0]).toHaveProperty("user_id", voyagerUserObj.id);
    });
  });
});
