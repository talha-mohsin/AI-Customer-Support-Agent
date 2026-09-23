import { api } from "./api";
import type { AgentActivityEvent, Conversation } from "../types";

interface ChatResponse {
  message: string;
  conversationId: string;
  activity: AgentActivityEvent[];
}

export async function sendMessage(
  message: string,
  conversationId?: string
): Promise<ChatResponse> {
  const { data } = await api.post<ChatResponse>("/chat", { message, conversationId });
  return data;
}

export async function getConversations(): Promise<Conversation[]> {
  const { data } = await api.get<{ conversations: Conversation[] }>("/conversations");
  return data.conversations;
}

export async function getConversation(id: string): Promise<Conversation> {
  const { data } = await api.get<{ conversation: Conversation }>(`/conversations/${id}`);
  return data.conversation;
}
