import { beforeAll, afterAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../src/app";
import { connectTestDB, clearTestDB, disconnectTestDB, createTestUser } from "./testUtils";

beforeAll(async () => {
  await connectTestDB();
});

beforeEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await disconnectTestDB();
});

describe("Auth", () => {
  it("registers a new customer", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Alex Customer",
      email: "alex@example.com",
      password: "Password123!",
    });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe("CUSTOMER");
    expect(res.body.user.password).toBeUndefined();
  });

  it("rejects registration with a duplicate email", async () => {
    await createTestUser({ email: "dup@example.com", password: "Password123!" });

    const res = await request(app).post("/api/auth/register").send({
      name: "Someone Else",
      email: "dup@example.com",
      password: "Password123!",
    });

    expect(res.status).toBe(409);
  });

  it("rejects registration with an invalid payload", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "A",
      email: "not-an-email",
      password: "123",
    });

    expect(res.status).toBe(400);
  });

  it("logs in with valid credentials", async () => {
    await createTestUser({ email: "login@example.com", password: "Password123!" });

    const res = await request(app).post("/api/auth/login").send({
      email: "login@example.com",
      password: "Password123!",
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it("rejects login with an invalid password", async () => {
    await createTestUser({ email: "wrongpass@example.com", password: "Password123!" });

    const res = await request(app).post("/api/auth/login").send({
      email: "wrongpass@example.com",
      password: "WrongPassword!",
    });

    expect(res.status).toBe(401);
  });

  it("rejects login for a nonexistent account", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "nobody@example.com",
      password: "Password123!",
    });

    expect(res.status).toBe(401);
  });

  it("blocks access to a protected route without a token", async () => {
    const res = await request(app).get("/api/users/me");
    expect(res.status).toBe(401);
  });

  it("blocks access to a protected route with a garbage token", async () => {
    const res = await request(app).get("/api/users/me").set("Authorization", "Bearer garbage");
    expect(res.status).toBe(401);
  });

  it("returns the authenticated user's own profile", async () => {
    await createTestUser({ email: "me@example.com", password: "Password123!", name: "Me" });
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: "me@example.com", password: "Password123!" });

    const res = await request(app)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${login.body.token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("me@example.com");
  });

  it("blocks a customer from accessing a support-only route", async () => {
    await createTestUser({ email: "cust@example.com", password: "Password123!", role: "CUSTOMER" });
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: "cust@example.com", password: "Password123!" });

    const res = await request(app)
      .get("/api/support/tickets")
      .set("Authorization", `Bearer ${login.body.token}`);

    expect(res.status).toBe(403);
  });
});
