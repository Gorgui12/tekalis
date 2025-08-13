import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [], // Liste des produits dans le panier
  totalAmount: 0, // Prix total du panier
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const product = action.payload;
      const existingItem = state.items.find((item) => item._id === product._id);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...product, quantity: 1 });
      }

      state.totalAmount += product.price;
    },

    removeFromCart: (state, action) => {
      const productId = action.payload;
      const existingItem = state.items.find((item) => item._id === productId);

      if (existingItem) {
        state.totalAmount -= existingItem.price * existingItem.quantity;
        state.items = state.items.filter((item) => item._id !== productId);
      }
    },

    increaseQuantity: (state, action) => {
      const productId = action.payload;
      const existingItem = state.items.find((item) => item._id === productId);

      if (existingItem) {
        existingItem.quantity += 1;
        state.totalAmount += existingItem.price;
      }
    },

    decreaseQuantity: (state, action) => {
      const productId = action.payload;
      const existingItem = state.items.find((item) => item._id === productId);

      if (existingItem && existingItem.quantity > 1) {
        existingItem.quantity -= 1;
        state.totalAmount -= existingItem.price;
      } else {
        state.items = state.items.filter((item) => item._id !== productId);
        state.totalAmount -= existingItem.price;
      }
    },

    clearCart: (state) => {
      state.items = [];
      state.totalAmount = 0;
    },
  },
});

export const { addToCart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
