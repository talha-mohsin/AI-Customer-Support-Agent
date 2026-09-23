import { StateGraph, MessagesAnnotation, START, END } from "@langchain/langgraph";
import { ToolNode, toolsCondition } from "@langchain/langgraph/prebuilt";
import { AIMessage, BaseMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { createChatModel } from "../config/ai";
import { createAgentTools, ToolActivityEvent } from "../services/tools/agentTools";
import { SUPPORT_AGENT_SYSTEM_PROMPT } from "./systemPrompt";
import type { IMessage } from "../models/Conversation";

export interface RunSupportAgentInput {
  customerId: string;
  conversationId: string;
  history: IMessage[];
  message: string;
}

export interface RunSupportAgentResult {
  reply: string;
  activity: ToolActivityEvent[];
}

function historyToMessages(history: IMessage[]): BaseMessage[] {
  return history.map((m) =>
    m.role === "assistant" ? new AIMessage(m.content) : new HumanMessage(m.content)
  );
}

export async function runSupportAgent(input: RunSupportAgentInput): Promise<RunSupportAgentResult> {
  const activity: ToolActivityEvent[] = [];
  const tools = createAgentTools(
    { customerId: input.customerId, conversationId: input.conversationId },
    activity
  );
  const model = createChatModel().bindTools(tools);

  const graph = new StateGraph(MessagesAnnotation)
    .addNode("agent", async (state) => {
      const response = await model.invoke(state.messages);
      return { messages: [response] };
    })
    .addNode("tools", new ToolNode(tools))
    .addEdge(START, "agent")
    .addConditionalEdges("agent", toolsCondition, { tools: "tools", [END]: END })
    .addEdge("tools", "agent")
    .compile();

  const messages: BaseMessage[] = [
    new SystemMessage(SUPPORT_AGENT_SYSTEM_PROMPT),
    ...historyToMessages(input.history),
    new HumanMessage(input.message),
  ];

  const result = await graph.invoke(
    { messages },
    { recursionLimit: 10 }
  );

  const finalMessage = result.messages[result.messages.length - 1];
  const reply = extractText(finalMessage.content);

  return { reply, activity };
}

function extractText(content: BaseMessage["content"]): string {
  if (typeof content === "string") return content;

  return content
    .filter((block): block is { type: "text"; text: string } => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
}
