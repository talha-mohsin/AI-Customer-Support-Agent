import { Request, Response } from "express";
import { Order } from "../models/Order";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";

export const getMyOrders = catchAsync(async (req: Request, res: Response) => {
  const orders = await Order.find({ customerId: req.user!.id }).sort({ createdAt: -1 });
  res.status(200).json({ orders });
});

export const getOrderByNumber = catchAsync(async (req: Request, res: Response) => {
  const order = await Order.findOne({
    orderNumber: req.params.orderNumber,
    customerId: req.user!.id,
  });

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  res.status(200).json({ order });
});
