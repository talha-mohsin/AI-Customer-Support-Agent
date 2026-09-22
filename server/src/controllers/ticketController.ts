import { Request, Response } from "express";
import { z } from "zod";
import { Ticket } from "../models/Ticket";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";

export const createTicketSchema = z.object({
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  conversationId: z.string().optional(),
});

export const updateTicketSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "ESCALATED", "RESOLVED", "CLOSED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  note: z.string().optional(),
});

export const getMyTickets = catchAsync(async (req: Request, res: Response) => {
  const tickets = await Ticket.find({ customerId: req.user!.id }).sort({ createdAt: -1 });
  res.status(200).json({ tickets });
});

export const createTicket = catchAsync(async (req: Request, res: Response) => {
  const { subject, description, priority, conversationId } = req.body as z.infer<
    typeof createTicketSchema
  >;

  const ticket = await Ticket.create({
    customerId: req.user!.id,
    subject,
    description,
    priority: priority ?? "MEDIUM",
    conversationId,
  });

  res.status(201).json({ ticket });
});

export const getAllTickets = catchAsync(async (_req: Request, res: Response) => {
  const tickets = await Ticket.find().sort({ createdAt: -1 }).populate("customerId", "name email");
  res.status(200).json({ tickets });
});

export const updateTicket = catchAsync(async (req: Request, res: Response) => {
  const { status, priority } = req.body as z.infer<typeof updateTicketSchema>;

  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    throw new AppError("Ticket not found", 404);
  }

  if (status) ticket.status = status;
  if (priority) ticket.priority = priority;
  if (!ticket.assignedTo) ticket.assignedTo = req.user!.id as unknown as typeof ticket.assignedTo;

  await ticket.save();

  res.status(200).json({ ticket });
});
