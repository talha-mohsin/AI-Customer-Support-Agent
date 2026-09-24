import dotenv from "dotenv";

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 5000),
  mongodbUri: required("MONGODB_URI", "mongodb://127.0.0.1:27017/ai-support-agent"),
  jwtSecret: required("JWT_SECRET", "dev-secret-change-me"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  clientOrigin: process.env.CLIENT_ORIGIN ?? "https://supportai-agent.vercel.app/",
  llmApiKey: required("LLM_API_KEY"),
  vectorDbApiKey: required("VECTOR_DB_API_KEY"),
  vectorDbIndex: required("VECTOR_DB_INDEX"),
};
