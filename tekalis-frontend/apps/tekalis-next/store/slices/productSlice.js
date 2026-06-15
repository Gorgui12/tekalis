import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";

export const fetchProducts = createAsyncThunk("products/fetchAll", async (params = {}, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams(params).toString();
    const { data } = await api.get(`/products?${query}`);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Erreur chargement produits");
  }
});

export const fetchProductBySlug = createAsyncThunk("products/fetchBySlug", async (slug, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/products/slug/${slug}`);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Produit introuvable");
  }
});

const productSlice = createSlice({
  name: "products",
  initialState: {
    allProducts: [],
    currentProduct: null,
    loading: false,
    error: null,
    pagination: { page: 1, pages: 1, total: 0 },
  },
  reducers: {
    clearCurrentProduct: (state) => { state.currentProduct = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.allProducts = Array.isArray(action.payload) ? action.payload : (action.payload.products || []);
        if (action.payload.pagination) state.pagination = action.payload.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchProductBySlug.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProductBySlug.fulfilled, (state, action) => { state.loading = false; state.currentProduct = action.payload; })
      .addCase(fetchProductBySlug.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { clearCurrentProduct } = productSlice.actions;
export default productSlice.reducer;