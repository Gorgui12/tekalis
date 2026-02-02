import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";

// Action asynchrone pour charger les produits
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/products");
      
      // 🔥 FIX CRITIQUE: S'assurer que products est toujours un tableau
      const products = Array.isArray(data) 
        ? data 
        : Array.isArray(data.products) 
          ? data.products 
          : [];
      
      return products;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Erreur de chargement");
    }
  }
);

// Action asynchrone pour charger un produit par ID
export const fetchProductById = createAsyncThunk(
  "products/fetchProductById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/products/${id}`);
      return data.product || data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Produit introuvable");
    }
  }
);

// Action asynchrone pour rechercher des produits
export const searchProducts = createAsyncThunk(
  "products/searchProducts",
  async (query, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/products/search?q=${query}`);
      
      const products = Array.isArray(data) 
        ? data 
        : Array.isArray(data.products) 
          ? data.products 
          : [];
      
      return products;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Erreur de recherche");
    }
  }
);

const productSlice = createSlice({
  name: "products",
  initialState: {
    items: [], // 🔥 TOUJOURS un tableau
    currentProduct: null,
    isLoading: false,
    error: null,
    searchResults: []
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    }
  },
  extraReducers: (builder) => {
    // Fetch all products
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        // 🔥 S'assurer que items est toujours un tableau
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.items = []; // Tableau vide en cas d'erreur
      });

    // Fetch product by ID
    builder
      .addCase(fetchProductById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.currentProduct = null;
      });

    // Search products
    builder
      .addCase(searchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.searchResults = [];
      });
  }
});

export const { clearError, clearCurrentProduct, clearSearchResults } = productSlice.actions;

export default productSlice.reducer;