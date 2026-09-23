import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AgentActivityEvent, Conversation, Message } from "../../types";
import * as chatService from "../../services/chatService";
import { getErrorMessage } from "../../services/api";

interface ConversationState {
  items: Conversation[];
  current: Conversation | null;
  listStatus: "idle" | "loading" | "succeeded" | "failed";
  currentStatus: "idle" | "loading" | "succeeded" | "failed";
  sending: boolean;
  lastActivity: AgentActivityEvent[];
  error: string | null;
}

const initialState: ConversationState = {
  items: [],
  current: null,
  listStatus: "idle",
  currentStatus: "idle",
  sending: false,
  lastActivity: [],
  error: null,
};

export const fetchConversations = createAsyncThunk(
  "conversations/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await chatService.getConversations();
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const fetchConversationById = createAsyncThunk(
  "conversations/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      return await chatService.getConversation(id);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const sendChatMessage = createAsyncThunk(
  "conversations/sendMessage",
  async (
    { message, conversationId }: { message: string; conversationId?: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await chatService.sendMessage(message, conversationId);
      return res;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

const conversationSlice = createSlice({
  name: "conversations",
  initialState,
  reducers: {
    clearCurrentConversation(state) {
      state.current = null;
      state.currentStatus = "idle";
      state.lastActivity = [];
    },
    appendLocalMessage(state, action: PayloadAction<Message>) {
      if (!state.current) {
        state.current = {
          _id: "",
          title: action.payload.content.slice(0, 60),
          status: "OPEN",
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
      state.current.messages.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.listStatus = "loading";
      })
      .addCase(fetchConversations.fulfilled, (state, action: PayloadAction<Conversation[]>) => {
        state.listStatus = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.listStatus = "failed";
        state.error = (action.payload as string) ?? "Failed to load conversations";
      })
      .addCase(fetchConversationById.pending, (state) => {
        state.currentStatus = "loading";
      })
      .addCase(
        fetchConversationById.fulfilled,
        (state, action: PayloadAction<Conversation>) => {
          state.currentStatus = "succeeded";
          state.current = action.payload;
        }
      )
      .addCase(fetchConversationById.rejected, (state, action) => {
        state.currentStatus = "failed";
        state.error = (action.payload as string) ?? "Failed to load conversation";
      })
      .addCase(sendChatMessage.pending, (state) => {
        state.sending = true;
        state.error = null;
        state.lastActivity = [];
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.sending = false;
        state.lastActivity = action.payload.activity;
        if (state.current) {
          state.current._id = action.payload.conversationId;
          state.current.messages.push({
            role: "assistant",
            content: action.payload.message,
            createdAt: new Date().toISOString(),
          });
        }
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.sending = false;
        state.error = (action.payload as string) ?? "Failed to send message";
      });
  },
});

export const { clearCurrentConversation, appendLocalMessage } = conversationSlice.actions;
export default conversationSlice.reducer;
