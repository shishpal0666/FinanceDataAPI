require("dotenv").config();
const request = require("supertest");
const app = require("../src/app");
const mongoose = require("mongoose");
const { MongoMemoryReplSet } = require("mongodb-memory-server");
const User = require("../src/models/User");
const FinancialRecord = require("../src/models/FinancialRecord");

let replSet;
let adminToken, analystToken, viewerToken;

beforeAll(async () => {
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongoose.connect(replSet.getUri());
});

beforeEach(async () => {
  // Create one user per role and capture their tokens
  const [adminRes, analystRes, viewerRes] = await Promise.all([
    request(app).post("/api/auth/register").send({
      name: "Admin",
      email: "admin@test.com",
      password: "password123",
      role: "admin",
    }),
    request(app).post("/api/auth/register").send({
      name: "Analyst",
      email: "analyst@test.com",
      password: "password123",
      role: "analyst",
    }),
    request(app).post("/api/auth/register").send({
      name: "Viewer",
      email: "viewer@test.com",
      password: "password123",
      role: "viewer",
    }),
  ]);

  adminToken = adminRes?.body?.data?.token || "";
  analystToken = analystRes?.body?.data?.token || "";
  viewerToken = viewerRes?.body?.data?.token || "";
});

afterEach(async () => {
  await User.deleteMany({});
  await FinancialRecord.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await replSet.stop();
});

const validRecord = {
  amount: 1500,
  type: "income",
  category: "Salary",
  date: "2024-06-15T00:00:00.000Z",
  description: "Monthly salary",
};

const createRecord = (token, body = validRecord) =>
  request(app)
    .post("/api/records")
    .set("Authorization", `Bearer ${token}`)
    .send(body);

describe("POST /api/records", () => {
  it("analyst should create a record successfully", async () => {
    const res = await createRecord(analystToken);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.amount).toBe(1500);
    expect(res.body.data.category).toBe("Salary");
  });

  it("admin should also create a record", async () => {
    const res = await createRecord(adminToken);
    expect(res.statusCode).toBe(201);
  });

  it("viewer should be forbidden from creating records", async () => {
    const res = await createRecord(viewerToken);
    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("should return 400 for missing required fields", async () => {
    const res = await createRecord(analystToken, { amount: 100 }); // missing type, category, date

    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeInstanceOf(Array);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  it("should return 400 for negative amount", async () => {
    const res = await createRecord(analystToken, {
      ...validRecord,
      amount: -50,
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: "amount" })]),
    );
  });

  it("unauthenticated request should return 401", async () => {
    const res = await request(app).post("/api/records").send(validRecord);
    expect(res.statusCode).toBe(401);
  });
});

describe("GET /api/records", () => {
  beforeEach(async () => {
    await createRecord(analystToken);
    await createRecord(analystToken, {
      ...validRecord,
      type: "expense",
      category: "Rent",
      amount: 800,
    });
  });

  it("any authenticated user can list records", async () => {
    const res = await request(app)
      .get("/api/records")
      .set("Authorization", `Bearer ${viewerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.meta).toHaveProperty("total", 2);
  });

  it("should filter records by type", async () => {
    const res = await request(app)
      .get("/api/records?type=expense")
      .set("Authorization", `Bearer ${viewerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.every((r) => r.type === "expense")).toBe(true);
  });

  it("should paginate results", async () => {
    const res = await request(app)
      .get("/api/records?page=1&limit=1")
      .set("Authorization", `Bearer ${viewerToken}`);

    expect(res.body.data).toHaveLength(1);
    expect(res.body.meta.totalPages).toBe(2);
  });
});

describe("DELETE /api/records/:id (soft delete)", () => {
  it("admin can soft-delete a record", async () => {
    const create = await createRecord(analystToken);
    const id = create.body.data._id;

    const del = await request(app)
      .delete(`/api/records/${id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(del.statusCode).toBe(200);

    // Record should no longer appear in list
    const list = await request(app)
      .get("/api/records")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(list.body.data.find((r) => r._id === id)).toBeUndefined();
  });

  it("analyst cannot delete records", async () => {
    const create = await createRecord(analystToken);
    const id = create.body.data._id;

    const res = await request(app)
      .delete(`/api/records/${id}`)
      .set("Authorization", `Bearer ${analystToken}`);

    expect(res.statusCode).toBe(403);
  });
});
