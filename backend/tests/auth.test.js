const request = require("supertest");
const app = require("../app");
const sequelize = require("../config/db");
const { resetDatabase, seedTestData } = require("./setup");
const { User } = require("../models");

beforeAll(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await sequelize.close();
});

describe("🔐 Authentication API Tests", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  describe("POST /api/register", () => {
    it("should successfully register a new voyager user", async () => {
      const res = await request(app)
        .post("/api/register")
        .send({
          name: "Alice Voyager",
          email: "alice@voyage.com",
          password: "password123",
          role: "voyager"
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("message", "User registered successfully");
      expect(res.body).toHaveProperty("user");
      expect(res.body.user).toHaveProperty("email", "alice@voyage.com");
      expect(res.body.user).toHaveProperty("role", "voyager");

      // Verify user was stored in database
      const dbUser = await User.findOne({ where: { email: "alice@voyage.com" } });
      expect(dbUser).not.toBeNull();
      expect(dbUser.name).toBe("Alice Voyager");
    });

    it("should reject registration if email already exists", async () => {
      await seedTestData();

      const res = await request(app)
        .post("/api/register")
        .send({
          name: "Duplicate User",
          email: "keerti123@gmail.com", // seeded email
          password: "newpassword",
          role: "voyager"
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("message", "Email already exists");
    });
  });

  describe("POST /api/login", () => {
    it("should successfully log in with valid credentials and return a token", async () => {
      await seedTestData();

      const res = await request(app)
        .post("/api/login")
        .send({
          email: "keerti123@gmail.com",
          password: "keerti123"
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message", "Logged in successfully");
      expect(res.body).toHaveProperty("token");
      expect(res.body).toHaveProperty("user");
      expect(res.body.user).toHaveProperty("email", "keerti123@gmail.com");
      expect(res.body.user).toHaveProperty("role", "voyager");
    });

    it("should reject login with an invalid password", async () => {
      await seedTestData();

      const res = await request(app)
        .post("/api/login")
        .send({
          email: "keerti123@gmail.com",
          password: "wrongpassword"
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("message", "Invalid email or password");
      expect(res.body).not.toHaveProperty("token");
    });

    it("should reject login with a non-existent email", async () => {
      const res = await request(app)
        .post("/api/login")
        .send({
          email: "nonexistent@cruise.com",
          password: "somepassword"
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("message", "Invalid email or password");
    });
  });
});
