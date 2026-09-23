import { createSlice } from "@reduxjs/toolkit";

interface UiState {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
}

const initialState: UiState = {
  sidebarCollapsed: localStorage.getItem("sidebarCollapsed") === "true",
  mobileSidebarOpen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebarCollapsed(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
      localStorage.setItem("sidebarCollapsed", String(state.sidebarCollapsed));
    },
    openMobileSidebar(state) {
      state.mobileSidebarOpen = true;
    },
    closeMobileSidebar(state) {
      state.mobileSidebarOpen = false;
    },
    toggleMobileSidebar(state) {
      state.mobileSidebarOpen = !state.mobileSidebarOpen;
    },
  },
});

export const {
  toggleSidebarCollapsed,
  openMobileSidebar,
  closeMobileSidebar,
  toggleMobileSidebar,
} = uiSlice.actions;
export default uiSlice.reducer;
