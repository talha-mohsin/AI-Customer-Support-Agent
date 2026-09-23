import {
  LayoutDashboard,
  MessageSquare,
  History,
  Ticket,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

export const customerNav: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/chat", label: "Chat", icon: MessageSquare },
  { to: "/conversations", label: "Conversations", icon: History },
  { to: "/tickets", label: "Tickets", icon: Ticket },
  { to: "/profile", label: "Profile", icon: User },
];

export const supportNav: NavItem[] = [
  { to: "/support/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/support/tickets", label: "Tickets", icon: Ticket },
  { to: "/support/customers", label: "Customers", icon: Users },
  { to: "/profile", label: "Profile", icon: User },
];
