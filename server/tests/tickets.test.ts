import { beforeAll, afterAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../src/app";
import { Ticket } from "../src/models/Ticket";
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

describe("Tickets", () => {
  it("lets a customer create a ticket", async () => {
    await createTestUser({ email: "cust@example.com", password: "Password123!" });
    const token = await loginAs("cust@example.com", "Password123!");

    const res = await request(app)
      .post("/api/tickets")
      .set("Authorization", `Bearer ${token}`)
      .send({ subject: "Billing issue", description: "Charged twice", priority: "HIGH" });

    expect(res.status).toBe(201);
    expect(res.body.ticket.status).toBe("OPEN");
    expect(res.body.ticket.priority).toBe("HIGH");
  });

  it("rejects a ticket with a missing subject/description", async () => {
    await createTestUser({ email: "cust2@example.com", password: "Password123!" });
    const token = await loginAs("cust2@example.com", "Password123!");

    const res = await request(app)
      .post("/api/tickets")
      .set("Authorization", `Bearer ${token}`)
      .send({ subject: "", description: "" });

    expect(res.status).toBe(400);
  });

  it("only returns the authenticated customer's own tickets", async () => {
    const customerA = await createTestUser({ email: "a@example.com", password: "Password123!" });
    const customerB = await createTestUser({ email: "b@example.com", password: "Password123!" });

    await Ticket.create({ customerId: customerA._id, subject: "A issue", description: "..." });
    await Ticket.create({ customerId: customerB._id, subject: "B issue", description: "..." });

    const tokenA = await loginAs("a@example.com", "Password123!");
    const res = await request(app).get("/api/tickets").set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.tickets).toHaveLength(1);
    expect(res.body.tickets[0].subject).toBe("A issue");
  });

  it("blocks a customer from the support ticket endpoints", async () => {
    await createTestUser({ email: "cust3@example.com", password: "Password123!" });
    const token = await loginAs("cust3@example.com", "Password123!");

    const res = await request(app).get("/api/support/tickets").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it("lets a support agent list and update any ticket", async () => {
    const customer = await createTestUser({ email: "cust4@example.com", password: "Password123!" });
    await createTestUser({ email: "support@example.com", password: "Password123!", role: "SUPPORT_AGENT" });

    const ticket = await Ticket.create({
      customerId: customer._id,
      subject: "Needs attention",
      description: "...",
    });

    const supportToken = await loginAs("support@example.com", "Password123!");

    const list = await request(app)
      .get("/api/support/tickets")
      .set("Authorization", `Bearer ${supportToken}`);
    expect(list.status).toBe(200);
    expect(list.body.tickets).toHaveLength(1);
    expect(list.body.tickets[0].customerId.email).toBe("cust4@example.com");

    const update = await request(app)
      .patch(`/api/support/tickets/${ticket._id}`)
      .set("Authorization", `Bearer ${supportToken}`)
      .send({ status: "RESOLVED" });

    expect(update.status).toBe(200);
    expect(update.body.ticket.status).toBe("RESOLVED");
  });

  it("lets a support agent escalate a ticket and reach ESCALATED status", async () => {
    const customer = await createTestUser({ email: "cust5@example.com", password: "Password123!" });
    await createTestUser({ email: "support2@example.com", password: "Password123!", role: "SUPPORT_AGENT" });

    const ticket = await Ticket.create({
      customerId: customer._id,
      subject: "Escalate me",
      description: "...",
    });

    const supportToken = await loginAs("support2@example.com", "Password123!");

    const update = await request(app)
      .patch(`/api/support/tickets/${ticket._id}`)
      .set("Authorization", `Bearer ${supportToken}`)
      .send({ status: "ESCALATED" });

    expect(update.status).toBe(200);
    expect(update.body.ticket.status).toBe("ESCALATED");
  });

  it("lists customers with order/ticket counts for support agents only", async () => {
    const customer = await createTestUser({ email: "cust6@example.com", password: "Password123!" });
    await createTestUser({ email: "support3@example.com", password: "Password123!", role: "SUPPORT_AGENT" });
    await Ticket.create({ customerId: customer._id, subject: "x", description: "y" });

    const supportToken = await loginAs("support3@example.com", "Password123!");
    const res = await request(app)
      .get("/api/support/customers")
      .set("Authorization", `Bearer ${supportToken}`);

    expect(res.status).toBe(200);
    expect(res.body.customers).toHaveLength(1);
    expect(res.body.customers[0].ticketCount).toBe(1);

    const custToken = await loginAs("cust6@example.com", "Password123!");
    const blocked = await request(app)
      .get("/api/support/customers")
      .set("Authorization", `Bearer ${custToken}`);
    expect(blocked.status).toBe(403);
  });
});
