import type { ConversationStatus, TicketPriority, TicketStatus } from "../types";

export const ticketStatusTone: Record<TicketStatus, "info" | "accent" | "warning" | "success" | "neutral"> = {
  OPEN: "info",
  IN_PROGRESS: "accent",
  ESCALATED: "warning",
  RESOLVED: "success",
  CLOSED: "neutral",
};

export const conversationStatusTone: Record<ConversationStatus, "info" | "warning" | "neutral"> = {
  OPEN: "info",
  ESCALATED: "warning",
  CLOSED: "neutral",
};

export const priorityTone: Record<TicketPriority, "neutral" | "info" | "warning" | "danger"> = {
  LOW: "neutral",
  MEDIUM: "info",
  HIGH: "warning",
  URGENT: "danger",
};
