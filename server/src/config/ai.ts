import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Pinecone } from "@pinecone-database/pinecone";
import { env } from "./env";

export const CHAT_MODEL = "gemini-3.6-flash";
export const EMBEDDING_MODEL = "models/gemini-embedding-001";
export const EMBEDDING_DIMENSIONS = 768;

export function createChatModel(): ChatGoogleGenerativeAI {
  return new ChatGoogleGenerativeAI({
    apiKey: env.llmApiKey,
    model: CHAT_MODEL,
    temperature: 0.2,
  });
}

export function createEmbeddings(): GoogleGenerativeAIEmbeddings {
  return new GoogleGenerativeAIEmbeddings({
    apiKey: env.llmApiKey,
    model: EMBEDDING_MODEL,
    outputDimensionality: EMBEDDING_DIMENSIONS,
  });
}

let pineconeClient: Pinecone | null = null;

export function getPineconeClient(): Pinecone {
  if (!pineconeClient) {
    pineconeClient = new Pinecone({ apiKey: env.vectorDbApiKey });
  }
  return pineconeClient;
}
