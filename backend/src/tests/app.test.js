const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let app;
let mongo;

beforeAll(async () => {
  process.env.JWT_ACCESS_SECRET = "test-access-secret";
  process.env.JWT_REFRESH_SECRET = "test-refresh-secret";
  process.env.CLIENT_URL = "http://localhost:5173";
  process.env.NODE_ENV = "test";

  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());

  app = require("../app");
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

test("health endpoint returns ok", async () => {
  const response = await request(app).get("/health");
  expect(response.statusCode).toBe(200);
  expect(response.body.status).toBe("ok");
});

test("signup and protected contacts flow works", async () => {
  const signup = await request(app)
    .post("/api/auth/signup")
    .send({
      name: "Syed Riyaz",
      email: "riyaz@example.com",
      password: "StrongPass123"
    });

  expect(signup.statusCode).toBe(201);
  expect(signup.body.accessToken).toBeTruthy();

  const token = signup.body.accessToken;

  const created = await request(app)
    .post("/api/contacts")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Acme Lead",
      email: "lead@acme.com",
      phone: "9876543210",
      company: "Acme",
      status: "Lead",
      notes: "Initial conversation"
    });

  expect(created.statusCode).toBe(201);
  expect(created.body.contact.name).toBe("Acme Lead");

  const list = await request(app)
    .get("/api/contacts?page=1&limit=10")
    .set("Authorization", `Bearer ${token}`);

  expect(list.statusCode).toBe(200);
  expect(list.body.pagination.limit).toBe(10);
  expect(list.body.contacts).toHaveLength(1);
});

test("unauthenticated contact request is rejected", async () => {
  const response = await request(app).get("/api/contacts");
  expect(response.statusCode).toBe(401);
});
