import { Request, Response } from "express";
import { z } from "zod";
import { Conversation } from "../models/Conversation";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";

export const chatSchema = z.object({
  conversationId: z.string().optional(),
  message: z.string().min(1, "Message cannot be empty"),
});

/**
 * Day 1 placeholder: persists the conversation turn without agent reasoning.
 * The LangGraph agent (RAG + tool calling) replaces this handler on Day 2.
 */
export const sendChatMessage = catchAsync(async (req: Request, res: Response) => {
  const { conversationId, message } = req.body as z.infer<typeof chatSchema>;

  let conversation = conversationId
    ? await Conversation.findOne({ _id: conversationId, customerId: req.user!.id })
    : null;

  if (conversationId && !conversation) {
    throw new AppError("Conversation not found", 404);
  }

  if (!conversation) {
    conversation = await Conversation.create({
      customerId: req.user!.id,
      title: message.slice(0, 60),
      messages: [],
    });
  }

  conversation.messages.push({ role: "user", content: message, createdAt: new Date() });

  const reply =
    "Thanks for reaching out. The AI agent is not wired up yet (coming on Day 2) — " +
    "your message has been recorded.";

  conversation.messages.push({ role: "assistant", content: reply, createdAt: new Date() });

  await conversation.save();

  res.status(200).json({ message: reply, conversationId: conversation._id });
});
