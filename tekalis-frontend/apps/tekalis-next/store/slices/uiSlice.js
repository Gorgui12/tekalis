import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: { theme: "light", sidebarOpen: false, modalOpen: false, modalContent: null },
  reducers: {
    toggleTheme: (state) => { state.theme = state.theme === "light" ? "dark" : "light"; },
    setTheme: (state, action) => { state.theme = action.payload; },
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen; },
    openModal: (state, action) => { state.modalOpen = true; state.modalContent = action.payload; },
    closeModal: (state) => { state.modalOpen = false; state.modalContent = null; },
  },
});

export const { toggleTheme, setTheme, toggleSidebar, openModal, closeModal } = uiSlice.actions;
export default uiSlice.reducer;