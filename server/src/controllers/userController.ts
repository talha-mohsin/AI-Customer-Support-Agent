import { Request, Response } from "express";
import { User } from "../models/User";
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
