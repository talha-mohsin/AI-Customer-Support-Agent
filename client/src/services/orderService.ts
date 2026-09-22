import { api } from "./api";
import type { Order } from "../types";

export async function getMyOrders(): Promise<Order[]> {
  const { data } = await api.get<{ orders: Order[] }>("/orders");
  return data.orders;
}

export async function getOrderByNumber(orderNumber: string): Promise<Order> {
  const { data } = await api.get<{ order: Order }>(`/orders/${orderNumber}`);
  return data.order;
}
