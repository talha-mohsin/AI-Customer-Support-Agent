import { Schema, model, Document, Types } from "mongoose";

export type MessageRole = "user" | "assistant" | "system";
export type ConversationStatus = "OPEN" | "ESCALATED" | "CLOSED";

export interface IMessage {
  role: MessageRole;
  content: string;
  createdAt: Date;
}

export interface IConversation extends Document {
  _id: Types.ObjectId;
  customerId: Types.ObjectId;
  title: string;
  messages: IMessage[];
  status: ConversationStatus;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    role: { type: String, enum: ["user", "assistant", "system"], required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const conversationSchema = new Schema<IConversation>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, default: "New Conversation" },
    messages: { type: [messageSchema], default: [] },
    status: { type: String, enum: ["OPEN", "ESCALATED", "CLOSED"], default: "OPEN" },
  },
  { timestamps: true }
);

export const Conversation = model<IConversation>("Conversation", conversationSchema);
