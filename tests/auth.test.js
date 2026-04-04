require("dotenv").config();
const request = require("supertest");
const app = require("../src/app");
const mongoose = require("mongoose");
const { MongoMemoryReplSet } = require("mongodb-memory-server");
const User = require("../src/models/User");

let replSet;

beforeAll(async () => {
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  // Override the mongoose connection used by the app
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongoose.connect(replSet.getUri());
});

afterEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await replSet.stop();
});

const registerUser = (overrides = {}) =>
  request(app)
    .post("/api/auth/register")
    .send({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      ...overrides,
    });

describe("POST /api/auth/register", () => {
  it("should register a new user and return a token", async () => {
    const res = await registerUser();

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("token");
    expect(res.body.data.user.email).toBe("test@example.com");
    expect(res.body.data.user).not.toHaveProperty("password");
  });

  it("should return 400 for invalid email", async () => {
    const res = await registerUser({ email: "not-an-email" });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: "email" })]),
    );
  });

  it("should return 400 if password is too short", async () => {
    const res = await registerUser({ password: "123" });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: "password" })]),
    );
  });

  it("should return 409 if email already exists", async () => {
    await registerUser(); // first registration
    const res = await registerUser(); // duplicate

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await registerUser(); // ensure user exists
  });

  it("should login with correct credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty("token");
  });

  it("should return 401 for wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "wrongpassword",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("should return 401 for non-existent email", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "ghost@example.com",
      password: "password123",
    });

    expect(res.statusCode).toBe(401);
  });
});

describe("GET /api/auth/me", () => {
  it("should return current user when authenticated", async () => {
    const register = await registerUser();
    const token = register.body.data.token;

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.email).toBe("test@example.com");
  });

  it("should return 401 when no token provided", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.statusCode).toBe(401);
  });

  it("should return 401 for an invalid token", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer invalid.token.here");

    expect(res.statusCode).toBe(401);
  });
});
