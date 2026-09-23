import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import conversationReducer from "./slices/conversationSlice";
import ticketReducer from "./slices/ticketSlice";
import orderReducer from "./slices/orderSlice";
import customerReducer from "./slices/customerSlice";
import uiReducer from "./slices/uiSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    conversations: conversationReducer,
    tickets: ticketReducer,
    orders: orderReducer,
    customers: customerReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
