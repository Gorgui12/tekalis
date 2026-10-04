import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: [], totalAmount: 0, promo: null },
  reducers: {
    addToCart: (state, action) => {
      const existing = state.items.find((i) => i._id === action.payload._id);
      if (existing) { existing.quantity += 1; }
      else { state.items.push({ ...action.payload, quantity: 1 }); }
      state.totalAmount = state.items.reduce((s, i) => s + i.price * i.quantity, 0);
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((i) => i._id !== action.payload);
      state.totalAmount = state.items.reduce((s, i) => s + i.price * i.quantity, 0);
    },
    increaseQuantity: (state, action) => {
      const item = state.items.find((i) => i._id === action.payload);
      if (item) item.quantity += 1;
      state.totalAmount = state.items.reduce((s, i) => s + i.price * i.quantity, 0);
    },
    decreaseQuantity: (state, action) => {
      const item = state.items.find((i) => i._id === action.payload);
      if (item && item.quantity > 1) item.quantity -= 1;
      state.totalAmount = state.items.reduce((s, i) => s + i.price * i.quantity, 0);
    },
    clearCart: (state) => { state.items = []; state.totalAmount = 0; state.promo = null; },
    applyPromo: (state, action) => { state.promo = action.payload; },
    removePromo: (state) => { state.promo = null; },
  },
});

export const { addToCart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart, applyPromo, removePromo } = cartSlice.actions;
export default cartSlice.reducer;