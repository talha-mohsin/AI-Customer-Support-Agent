import { beforeAll, afterAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../src/app";
import { Order } from "../src/models/Order";
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

async function loginAs(email: string, password: string): Promise<string> {
  const res = await request(app).post("/api/auth/login").send({ email, password });
  return res.body.token;
}

describe("Orders", () => {
  it("returns only the authenticated customer's own orders", async () => {
    const customerA = await createTestUser({ email: "a@example.com", password: "Password123!" });
    const customerB = await createTestUser({ email: "b@example.com", password: "Password123!" });

    await Order.create({
      customerId: customerA._id,
      orderNumber: "ORD-A1",
      status: "SHIPPED",
      items: [{ name: "Widget", quantity: 1, price: 10 }],
      totalAmount: 10,
    });
    await Order.create({
      customerId: customerB._id,
      orderNumber: "ORD-B1",
      status: "DELIVERED",
      items: [{ name: "Gadget", quantity: 1, price: 20 }],
      totalAmount: 20,
    });

    const tokenA = await loginAs("a@example.com", "Password123!");
    const res = await request(app).get("/api/orders").set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.orders).toHaveLength(1);
    expect(res.body.orders[0].orderNumber).toBe("ORD-A1");
  });

  it("returns a valid order by number for its owner", async () => {
    const customer = await createTestUser({ email: "owner@example.com", password: "Password123!" });
    await Order.create({
      customerId: customer._id,
      orderNumber: "ORD-1001",
      status: "SHIPPED",
      items: [{ name: "Widget", quantity: 1, price: 10 }],
      totalAmount: 10,
    });

    const token = await loginAs("owner@example.com", "Password123!");
    const res = await request(app)
      .get("/api/orders/ORD-1001")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.order.status).toBe("SHIPPED");
  });

  it("returns 404 for an order that does not exist", async () => {
    await createTestUser({ email: "nobody@example.com", password: "Password123!" });
    const token = await loginAs("nobody@example.com", "Password123!");

    const res = await request(app)
      .get("/api/orders/ORD-9999")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it("returns 404 (not another customer's order) when the order belongs to someone else", async () => {
    const owner = await createTestUser({ email: "owner2@example.com", password: "Password123!" });
    const attacker = await createTestUser({ email: "attacker@example.com", password: "Password123!" });

    await Order.create({
      customerId: owner._id,
      orderNumber: "ORD-SECRET",
      status: "PROCESSING",
      items: [{ name: "Widget", quantity: 1, price: 10 }],
      totalAmount: 10,
    });

    const attackerToken = await loginAs("attacker@example.com", "Password123!");
    const res = await request(app)
      .get("/api/orders/ORD-SECRET")
      .set("Authorization", `Bearer ${attackerToken}`);

    expect(res.status).toBe(404);
  });

  it("blocks a support agent from using the customer orders route", async () => {
    await createTestUser({ email: "support@example.com", password: "Password123!", role: "SUPPORT_AGENT" });
    const token = await loginAs("support@example.com", "Password123!");

    const res = await request(app).get("/api/orders").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });
});
