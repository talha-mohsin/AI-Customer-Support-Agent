import { Request, Response } from "express";
import { User } from "../models/User";
import { Order } from "../models/Order";
import { Ticket } from "../models/Ticket";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";

export const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  res.status(200).json({
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

export const getCustomers = catchAsync(async (_req: Request, res: Response) => {
  const customers = await User.find({ role: "CUSTOMER" }).sort({ createdAt: -1 });

  const customersWithStats = await Promise.all(
    customers.map(async (customer) => {
      const [orderCount, ticketCount] = await Promise.all([
        Order.countDocuments({ customerId: customer._id }),
        Ticket.countDocuments({ customerId: customer._id }),
      ]);
      return {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        createdAt: customer.createdAt,
        orderCount,
        ticketCount,
      };
    })
  );

  res.status(200).json({ customers: customersWithStats });
});
