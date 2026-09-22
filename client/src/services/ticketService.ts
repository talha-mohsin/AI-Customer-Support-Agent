import { api } from "./api";
import type { Ticket, TicketPriority, TicketStatus } from "../types";

export async function getMyTickets(): Promise<Ticket[]> {
  const { data } = await api.get<{ tickets: Ticket[] }>("/tickets");
  return data.tickets;
}

export async function createTicket(
  subject: string,
  description: string,
  priority?: TicketPriority
): Promise<Ticket> {
  const { data } = await api.post<{ ticket: Ticket }>("/tickets", {
    subject,
    description,
    priority,
  });
  return data.ticket;
}

export async function getAllTickets(): Promise<Ticket[]> {
  const { data } = await api.get<{ tickets: Ticket[] }>("/support/tickets");
  return data.tickets;
}

export async function updateTicket(
  id: string,
  updates: { status?: TicketStatus; priority?: TicketPriority }
): Promise<Ticket> {
  const { data } = await api.patch<{ ticket: Ticket }>(`/support/tickets/${id}`, updates);
  return data.ticket;
}
