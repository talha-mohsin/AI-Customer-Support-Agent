import { api } from "./api";
import type { User } from "../types";

interface AuthResponse {
  token: string;
  user: User;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/login", { email, password });
  return data;
}

export async function register(
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/register", { name, email, password });
  return data;
}

export async function getMe(): Promise<User> {
  const { data } = await api.get<{ user: User }>("/users/me");
  return data.user;
}
