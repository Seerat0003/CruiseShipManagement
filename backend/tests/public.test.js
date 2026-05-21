const request = require("supertest");
const app = require("../app");
const sequelize = require("../config/db");
const { resetDatabase, seedTestData } = require("./setup");

beforeAll(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await sequelize.close();
});

describe("🌐 Public API Tests", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("GET /api/public/cruises should return list of all active cruises", async () => {
    await seedTestData();

    const res = await request(app).get("/api/public/cruises");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0]).toHaveProperty("name", "Test Mediterranean Voyage");
    expect(res.body[0]).toHaveProperty("route", "Rome -> Athens -> Istanbul");
  });

  it("GET /api/public/services should return list of all premium services", async () => {
    await seedTestData();

    const res = await request(app).get("/api/public/services");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(3); // 3 services seeded
    const serviceNames = res.body.map(s => s.name);
    expect(serviceNames).toContain("Luxury Spa Treatment");
    expect(serviceNames).toContain("Fitness Centre Access");
    expect(serviceNames).toContain("Grand Deck Party Hall");
  });

  it("GET /api/public/bookings should return public booking metrics (slots & statuses only)", async () => {
    const { voyagerUser, diningService } = await seedTestData();
    
    // Create a mock booking
    const { Booking } = require("../models");
    await Booking.create({
      user_id: voyagerUser.id,
      service_id: diningService.id,
      start_time: new Date("2026-06-15T18:00:00.000Z"),
      end_time: new Date("2026-06-15T21:00:00.000Z"),
      status: "Pending"
    });

    const res = await request(app).get("/api/public/bookings");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    
    // Check fields are filtered for privacy
    expect(res.body[0]).toHaveProperty("service_id", diningService.id);
    expect(res.body[0]).toHaveProperty("start_time");
    expect(res.body[0]).toHaveProperty("status", "Pending");
    
    // Crucial: check passenger user_id is NOT leaked
    expect(res.body[0]).not.toHaveProperty("user_id");
  });
});
