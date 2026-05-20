import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: { notifications: [], theme: 'light' },
  reducers: {
    addNotification(state, { payload }) {
      state.notifications.push({ id: Date.now(), ...payload });
    },
    removeNotification(state, { payload }) {
      state.notifications = state.notifications.filter((n) => n.id !== payload);
    },
    clearNotifications(state) {
      state.notifications = [];
    },
    setTheme(state, { payload }) {
      state.theme = payload;
    },
  },
});

export const { addNotification, removeNotification, clearNotifications, setTheme } = uiSlice.actions;
export default uiSlice.reducer;