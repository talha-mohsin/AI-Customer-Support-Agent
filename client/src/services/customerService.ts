import { api } from "./api";
import type { CustomerSummary } from "../types";

export async function getCustomers(): Promise<CustomerSummary[]> {
  const { data } = await api.get<{ customers: CustomerSummary[] }>("/support/customers");
  return data.customers;
}
