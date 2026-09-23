import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { User } from "../../models/User";
import { Order } from "../../models/Order";
import { Ticket } from "../../models/Ticket";
import { Conversation } from "../../models/Conversation";
import { searchKnowledgeBase as ragSearch } from "../rag/ragService";

export interface AgentToolContext {
  customerId: string;
  conversationId: string;
}

export interface ToolActivityEvent {
  tool: string;
  label: string;
}

/**
 * Tools are created per-request, closed over the authenticated customer's own
 * id/conversation. The model can never pass a customerId/conversationId itself,
 * so it cannot read or act on another customer's data.
 */
export function createAgentTools(ctx: AgentToolContext, activityLog: ToolActivityEvent[]) {
  const searchKnowledgeBaseTool = tool(
    async ({ query }: { query: string }) => {
      activityLog.push({ tool: "searchKnowledgeBase", label: "Searching knowledge base..." });
      const results = await ragSearch(query, 4);

      if (results.length === 0) {
        return "No relevant company documentation was found for this question.";
      }

      return results
        .map((r, i) => `[${i + 1}] (source: ${r.source})\n${r.text}`)
        .join("\n\n---\n\n");
    },
    {
      name: "searchKnowledgeBase",
      description:
        "Search the private company knowledge base (refund, shipping, account, warranty policies, FAQ) for grounded answers to policy questions. Always use this before answering any policy/process question.",
      schema: z.object({
        query: z.string().describe("The customer's question or topic to search for"),
      }),
    }
  );

  const getCustomerTool = tool(
    async () => {
      activityLog.push({ tool: "getCustomer", label: "Checking your account..." });
      const user = await User.findById(ctx.customerId);
      if (!user) return "Customer account not found.";
      return JSON.stringify({ name: user.name, email: user.email, role: user.role });
    },
    {
      name: "getCustomer",
      description: "Get the authenticated customer's own profile (name, email). Takes no arguments.",
      schema: z.object({}),
    }
  );

  const getOrderTool = tool(
    async ({ orderNumber }: { orderNumber: string }) => {
      activityLog.push({ tool: "getOrder", label: `Checking order ${orderNumber}...` });
      const order = await Order.findOne({ orderNumber, customerId: ctx.customerId });
      if (!order) {
        return `No order found with number "${orderNumber}" for this customer.`;
      }
      return JSON.stringify({
        orderNumber: order.orderNumber,
        status: order.status,
        items: order.items,
        totalAmount: order.totalAmount,
        trackingNumber: order.trackingNumber ?? null,
        createdAt: order.createdAt,
      });
    },
    {
      name: "getOrder",
      description:
        "Look up an order by its order number. Only returns the order if it belongs to the authenticated customer.",
      schema: z.object({
        orderNumber: z.string().describe('The order number, e.g. "ORD-1001"'),
      }),
    }
  );

  const createSupportTicketTool = tool(
    async ({
      subject,
      description,
      priority,
    }: {
      subject: string;
      description: string;
      priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    }) => {
      activityLog.push({ tool: "createSupportTicket", label: "Creating support ticket..." });
      const ticket = await Ticket.create({
        customerId: ctx.customerId,
        conversationId: ctx.conversationId,
        subject,
        description,
        priority: priority ?? "MEDIUM",
      });
      return `Ticket created: id=${ticket._id}, subject="${ticket.subject}", priority=${ticket.priority}, status=${ticket.status}.`;
    },
    {
      name: "createSupportTicket",
      description:
        "Create a real support ticket for the customer when they explicitly want one opened for an issue that needs follow-up.",
      schema: z.object({
        subject: z.string().describe("Short ticket subject"),
        description: z.string().describe("Details of the customer's issue"),
        priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
      }),
    }
  );

  const escalateToHumanTool = tool(
    async ({ reason }: { reason: string }) => {
      activityLog.push({ tool: "escalateToHuman", label: "Escalating to support..." });

      await Conversation.findByIdAndUpdate(ctx.conversationId, { status: "ESCALATED" });

      let ticket = await Ticket.findOne({
        conversationId: ctx.conversationId,
        status: { $in: ["OPEN", "IN_PROGRESS", "ESCALATED"] },
      }).sort({ createdAt: -1 });

      if (ticket) {
        ticket.status = "ESCALATED";
        ticket.description = `${ticket.description}\n\nEscalation reason: ${reason}`;
        await ticket.save();
      } else {
        ticket = await Ticket.create({
          customerId: ctx.customerId,
          conversationId: ctx.conversationId,
          subject: "Escalated to human support",
          description: reason,
          priority: "HIGH",
          status: "ESCALATED",
        });
      }

      return `Conversation escalated to human support. Ticket ${ticket._id} is now ESCALATED and will be reviewed by a support agent.`;
    },
    {
      name: "escalateToHuman",
      description:
        "Escalate the current conversation to a human support agent when the customer explicitly asks for a human, or the issue cannot be resolved by the AI.",
      schema: z.object({
        reason: z.string().describe("Why this conversation needs human intervention"),
      }),
    }
  );

  return [
    searchKnowledgeBaseTool,
    getCustomerTool,
    getOrderTool,
    createSupportTicketTool,
    escalateToHumanTool,
  ];
}
