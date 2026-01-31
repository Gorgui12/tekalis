import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    // Notifications/Toasts
    notifications: [],
    
    // Modals
    modals: {
      login: false,
      register: false,
      productQuickView: false,
      confirmDelete: false,
      addressForm: false,
      reviewForm: false
    },
    
    // Modal data
    modalData: null,
    
    // Loading states
    loading: {
      global: false,
      page: false,
      action: false
    },
    
    // Sidebar/Menu states
    sidebar: {
      open: false,
      mobileMenu: false
    },
    
    // Theme
    theme: "light",
    
    // Filters visibility
    filtersVisible: false
  },
  reducers: {
    // Notifications
    addNotification: (state, action) => {
      const notification = {
        id: Date.now(),
        type: action.payload.type || "info", // success, error, warning, info
        message: action.payload.message,
        duration: action.payload.duration || 3000
      };
      state.notifications.push(notification);
    },
    
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    
    clearNotifications: (state) => {
      state.notifications = [];
    },
    
    // Modals
    openModal: (state, action) => {
      const { modalName, data } = action.payload;
      if (state.modals.hasOwnProperty(modalName)) {
        state.modals[modalName] = true;
        state.modalData = data || null;
      }
    },
    
    closeModal: (state, action) => {
      const modalName = action.payload;
      if (state.modals.hasOwnProperty(modalName)) {
        state.modals[modalName] = false;
        state.modalData = null;
      }
    },
    
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(key => {
        state.modals[key] = false;
      });
      state.modalData = null;
    },
    
    // Loading states
    setLoading: (state, action) => {
      const { type, value } = action.payload;
      if (state.loading.hasOwnProperty(type)) {
        state.loading[type] = value;
      }
    },
    
    setGlobalLoading: (state, action) => {
      state.loading.global = action.payload;
    },
    
    // Sidebar/Menu
    toggleSidebar: (state) => {
      state.sidebar.open = !state.sidebar.open;
    },
    
    closeSidebar: (state) => {
      state.sidebar.open = false;
    },
    
    toggleMobileMenu: (state) => {
      state.sidebar.mobileMenu = !state.sidebar.mobileMenu;
    },
    
    closeMobileMenu: (state) => {
      state.sidebar.mobileMenu = false;
    },
    
    // Theme
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light";
    },
    
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    
    // Filters
    toggleFilters: (state) => {
      state.filtersVisible = !state.filtersVisible;
    },
    
    setFiltersVisible: (state, action) => {
      state.filtersVisible = action.payload;
    }
  }
});

export const {
  // Notifications
  addNotification,
  removeNotification,
  clearNotifications,
  
  // Modals
  openModal,
  closeModal,
  closeAllModals,
  
  // Loading
  setLoading,
  setGlobalLoading,
  
  // Sidebar/Menu
  toggleSidebar,
  closeSidebar,
  toggleMobileMenu,
  closeMobileMenu,
  
  // Theme
  toggleTheme,
  setTheme,
  
  // Filters
  toggleFilters,
  setFiltersVisible
} = uiSlice.actions;

export default uiSlice.reducer;

// Selectors
export const selectNotifications = (state) => state.ui.notifications;
export const selectModals = (state) => state.ui.modals;
export const selectModalData = (state) => state.ui.modalData;
export const selectLoading = (state) => state.ui.loading;
export const selectSidebar = (state) => state.ui.sidebar;
export const selectTheme = (state) => state.ui.theme;
export const selectFiltersVisible = (state) => state.ui.filtersVisible;