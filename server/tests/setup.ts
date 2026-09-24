import dotenv from "dotenv";

dotenv.config();

const original = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/ai-support-agent";
process.env.MONGODB_URI = original.replace(/\/([^/?]+)(\?|$)/, "/ai-support-agent-test$2");
process.env.NODE_ENV = "test";
