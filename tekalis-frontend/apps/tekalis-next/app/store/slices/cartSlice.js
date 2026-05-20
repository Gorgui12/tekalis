import { createSlice } from '@reduxjs/toolkit';

const sanitize = (p) => ({
  _id: p._id,
  name: p.name,
  price: p.price,
  comparePrice: p.comparePrice || null,
  stock: p.stock,
  brand: p.brand || '',
  images: p.images || [],
  image: p.image || null,
  category: Array.isArray(p.category)
    ? p.category.map((c) => (typeof c === 'object' ? c.name : c))
    : p.category ? [typeof p.category === 'object' ? p.category.name : p.category] : [],
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], totalAmount: 0 },
  reducers: {
    addToCart(state, { payload }) {
      const p = sanitize(payload);
      const found = state.items.find((i) => i._id === p._id);
      if (found) found.quantity += 1;
      else state.items.push({ ...p, quantity: 1 });
      state.totalAmount += p.price;
    },
    removeFromCart(state, { payload }) {
      const item = state.items.find((i) => i._id === payload);
      if (item) {
        state.totalAmount -= item.price * item.quantity;
        state.items = state.items.filter((i) => i._id !== payload);
      }
    },
    increaseQuantity(state, { payload }) {
      const item = state.items.find((i) => i._id === payload);
      if (item) { item.quantity += 1; state.totalAmount += item.price; }
    },
    decreaseQuantity(state, { payload }) {
      const item = state.items.find((i) => i._id === payload);
      if (!item) return;
      state.totalAmount -= item.price;
      if (item.quantity > 1) item.quantity -= 1;
      else state.items = state.items.filter((i) => i._id !== payload);
    },
    clearCart(state) {
      state.items = [];
      state.totalAmount = 0;
    },
  },
});

export const { addToCart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;