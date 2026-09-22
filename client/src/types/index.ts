export type UserRole = "CUSTOMER" | "SUPPORT_AGENT";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export type OrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  trackingNumber?: string;
  createdAt: string;
}

export type ConversationStatus = "OPEN" | "ESCALATED" | "CLOSED";

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  title: string;
  status: ConversationStatus;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TicketStatus = "OPEN" | "IN_PROGRESS" | "ESCALATED" | "RESOLVED" | "CLOSED";

export interface Ticket {
  _id: string;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  customerId: string | { _id: string; name: string; email: string };
  conversationId?: string;
  createdAt: string;
  updatedAt: string;
}
