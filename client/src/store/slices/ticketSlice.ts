import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Ticket, TicketPriority, TicketStatus } from "../../types";
import * as ticketService from "../../services/ticketService";
import { getErrorMessage } from "../../services/api";

interface TicketState {
  myTickets: Ticket[];
  allTickets: Ticket[];
  status: "idle" | "loading" | "succeeded" | "failed";
  creating: boolean;
  error: string | null;
}

const initialState: TicketState = {
  myTickets: [],
  allTickets: [],
  status: "idle",
  creating: false,
  error: null,
};

export const fetchMyTickets = createAsyncThunk(
  "tickets/fetchMine",
  async (_, { rejectWithValue }) => {
    try {
      return await ticketService.getMyTickets();
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const createTicket = createAsyncThunk(
  "tickets/create",
  async (
    payload: { subject: string; description: string; priority?: TicketPriority },
    { rejectWithValue }
  ) => {
    try {
      return await ticketService.createTicket(
        payload.subject,
        payload.description,
        payload.priority
      );
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const fetchAllTickets = createAsyncThunk(
  "tickets/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await ticketService.getAllTickets();
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const updateTicket = createAsyncThunk(
  "tickets/update",
  async (
    { id, updates }: { id: string; updates: { status?: TicketStatus; priority?: TicketPriority } },
    { rejectWithValue }
  ) => {
    try {
      const updated = await ticketService.updateTicket(id, updates);
      return updated;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

const ticketSlice = createSlice({
  name: "tickets",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyTickets.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMyTickets.fulfilled, (state, action: PayloadAction<Ticket[]>) => {
        state.status = "succeeded";
        state.myTickets = action.payload;
      })
      .addCase(fetchMyTickets.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) ?? "Failed to load tickets";
      })
      .addCase(createTicket.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createTicket.fulfilled, (state, action: PayloadAction<Ticket>) => {
        state.creating = false;
        state.myTickets.unshift(action.payload);
      })
      .addCase(createTicket.rejected, (state, action) => {
        state.creating = false;
        state.error = (action.payload as string) ?? "Failed to create ticket";
      })
      .addCase(fetchAllTickets.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAllTickets.fulfilled, (state, action: PayloadAction<Ticket[]>) => {
        state.status = "succeeded";
        state.allTickets = action.payload;
      })
      .addCase(fetchAllTickets.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) ?? "Failed to load tickets";
      })
      .addCase(updateTicket.fulfilled, (state, action: PayloadAction<Ticket>) => {
        const index = state.allTickets.findIndex((t) => t._id === action.payload._id);
        if (index !== -1) {
          const previousCustomer = state.allTickets[index].customerId;
          state.allTickets[index] = {
            ...action.payload,
            customerId:
              typeof action.payload.customerId === "object"
                ? action.payload.customerId
                : previousCustomer,
          };
        }
      })
      .addCase(updateTicket.rejected, (state, action) => {
        state.error = (action.payload as string) ?? "Failed to update ticket";
      });
  },
});

export default ticketSlice.reducer;
