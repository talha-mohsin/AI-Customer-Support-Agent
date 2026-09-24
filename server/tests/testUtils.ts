import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "../src/config/db";
import { User } from "../src/models/User";
import { Order } from "../src/models/Order";
import { Ticket } from "../src/models/Ticket";
import { Conversation } from "../src/models/Conversation";

export async function connectTestDB(): Promise<void> {
  if (mongoose.connection.readyState === 0) {
    await connectDB();
  }
}

export async function clearTestDB(): Promise<void> {
  await Promise.all([
    User.deleteMany({}),
    Order.deleteMany({}),
    Ticket.deleteMany({}),
    Conversation.deleteMany({}),
  ]);
}

export async function disconnectTestDB(): Promise<void> {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
}

export async function createTestUser(overrides: {
  name?: string;
  email: string;
  password: string;
  role?: "CUSTOMER" | "SUPPORT_AGENT";
}) {
  const hashed = await bcrypt.hash(overrides.password, 10);
  return User.create({
    name: overrides.name ?? "Test User",
    email: overrides.email,
    password: hashed,
    role: overrides.role ?? "CUSTOMER",
  });
}
