import bcrypt from "bcryptjs";
import { connectDB } from "../config/db";
import { User } from "../models/User";
import { Order } from "../models/Order";
import { Ticket } from "../models/Ticket";
import { Conversation } from "../models/Conversation";
import mongoose from "mongoose";

async function seed(): Promise<void> {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Order.deleteMany({}),
    Ticket.deleteMany({}),
    Conversation.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash("Password123!", 10);

  const customer = await User.create({
    name: "Alex Customer",
    email: "customer@example.com",
    password: passwordHash,
    role: "CUSTOMER",
  });

  await User.create({
    name: "Sam Support",
    email: "support@example.com",
    password: passwordHash,
    role: "SUPPORT_AGENT",
  });

  await Order.create([
    {
      customerId: customer._id,
      orderNumber: "ORD-1001",
      status: "SHIPPED",
      items: [{ name: "Wireless Headphones", quantity: 1, price: 79.99 }],
      totalAmount: 79.99,
      trackingNumber: "TRK-556213",
    },
    {
      customerId: customer._id,
      orderNumber: "ORD-1002",
      status: "DELIVERED",
      items: [{ name: "USB-C Charging Cable", quantity: 2, price: 12.5 }],
      totalAmount: 25.0,
      trackingNumber: "TRK-778821",
    },
    {
      customerId: customer._id,
      orderNumber: "ORD-1003",
      status: "PROCESSING",
      items: [{ name: "Mechanical Keyboard", quantity: 1, price: 129.0 }],
      totalAmount: 129.0,
    },
  ]);

  console.log("[seed] done");
  console.log("customer@example.com / Password123!");
  console.log("support@example.com / Password123!");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("[seed] failed", err);
  process.exit(1);
});
