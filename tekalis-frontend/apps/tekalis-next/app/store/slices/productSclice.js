import { createSlice } from '@reduxjs/toolkit';

const productSlice = createSlice({
  name: 'products',
  initialState: { items: [], isLoading: false, error: null },
  reducers: {
    setProducts(state, { payload }) {
      state.items = Array.isArray(payload) ? payload : [];
    },
    setLoading(state, { payload }) {
      state.isLoading = payload;
    },
    setError(state, { payload }) {
      state.error = payload;
    },
  },
});

export const { setProducts, setLoading, setError } = productSlice.actions;
export default productSlice.reducer;