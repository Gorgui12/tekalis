import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/api';

const sanitize = (p) => ({
  _id: p._id, name: p.name, price: p.price,
  comparePrice: p.comparePrice || null, stock: p.stock,
  brand: p.brand || '', images: p.images || [], image: p.image || null,
  category: Array.isArray(p.category)
    ? p.category.map((c) => (typeof c === 'object' ? c.name : c))
    : p.category ? [typeof p.category === 'object' ? p.category.name : p.category] : [],
});

export const addToWishlist = createAsyncThunk('wishlist/add', async (productId) => {
  const id = typeof productId === 'object' ? productId._id : productId;
  const { data } = await api.post('/wishlist', { productId: id });
  return data;
});

export const removeFromWishlist = createAsyncThunk('wishlist/remove', async (productId) => {
  await api.delete(`/wishlist/${productId}`);
  return productId;
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { items: [], loading: false },
  reducers: {
    addToWishlistLocal(state, { payload }) {
      const p = sanitize(payload);
      if (!state.items.find((i) => i._id === p._id)) state.items.push(p);
    },
    removeFromWishlistLocal(state, { payload }) {
      state.items = state.items.filter((i) => i._id !== payload);
    },
  },
  extraReducers: (b) => {
    b.addCase(addToWishlist.fulfilled, (s, a) => {
      if (a.payload.item) s.items.push(sanitize(a.payload.item));
    })
    .addCase(removeFromWishlist.fulfilled, (s, a) => {
      s.items = s.items.filter((i) => i._id !== a.payload);
    });
  },
});

export const { addToWishlistLocal, removeFromWishlistLocal } = wishlistSlice.actions;
export default wishlistSlice.reducer;