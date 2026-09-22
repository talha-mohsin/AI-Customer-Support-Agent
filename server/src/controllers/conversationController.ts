import { Request, Response } from "express";
import { Conversation } from "../models/Conversation";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";

export const getMyConversations = catchAsync(async (req: Request, res: Response) => {
  const conversations = await Conversation.find({ customerId: req.user!.id })
    .sort({ updatedAt: -1 })
    .select("title status createdAt updatedAt");
  res.status(200).json({ conversations });
});

export const getConversationById = catchAsync(async (req: Request, res: Response) => {
  const conversation = await Conversation.findOne({
    _id: req.params.id,
    customerId: req.user!.id,
  });

  if (!conversation) {
    throw new AppError("Conversation not found", 404);
  }

  res.status(200).json({ conversation });
});
