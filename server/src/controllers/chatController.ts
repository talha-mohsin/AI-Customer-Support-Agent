import { Request, Response } from "express";
import { z } from "zod";
import { Conversation, IMessage } from "../models/Conversation";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";
import { runSupportAgent } from "../agents/supportAgent";

export const chatSchema = z.object({
  conversationId: z.string().optional(),
  message: z.string().min(1, "Message cannot be empty"),
});

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

  const history: IMessage[] = [...conversation.messages];

  conversation.messages.push({ role: "user", content: message, createdAt: new Date() });

  let reply: string;
  let activity: { tool: string; label: string }[] = [];

  try {
    const result = await runSupportAgent({
      customerId: req.user!.id,
      conversationId: conversation._id.toString(),
      history,
      message,
    });
    reply = result.reply;
    activity = result.activity;
  } catch (err) {
    console.error("[chat] agent failure", err);
    reply =
      "Sorry, I'm having trouble processing that right now. You can try again in a moment, " +
      "or ask me to connect you with a human agent.";
  }

  conversation.messages.push({ role: "assistant", content: reply, createdAt: new Date() });

  await conversation.save();

  res.status(200).json({ message: reply, conversationId: conversation._id, activity });
});
