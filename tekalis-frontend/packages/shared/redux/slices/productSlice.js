import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../../packages/shared/api/api";

/**
 * ✅ Thunk : Charger tous les produits
 */
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (_, thunkAPI) => {
    try {
      const response = await api.get("/products");

      const data = response.data;

      // ✅ Support des deux formats API
      if (Array.isArray(data)) {
        return data;
      } else if (data && Array.isArray(data.products)) {
        return data.products;
      }

      console.warn("⚠️ Format inattendu:", data);
      return [];
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Erreur de chargement"
      );
    }
  }
);

/**
 * ✅ Thunk : Charger un produit par ID
 */
export const fetchProductById = createAsyncThunk(
  "products/fetchProductById",
  async (id, thunkAPI) => {
    try {
      const response = await api.get(`/products/${id}`);
      const data = response.data;

      return data.product || data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Produit introuvable"
      );
    }
  }
);

/**
 * ✅ Thunk : Recherche produits
 */
export const searchProducts = createAsyncThunk(
  "products/searchProducts",
  async (query, thunkAPI) => {
    try {
      const response = await api.get(`/products/search?q=${query}`);
      const data = response.data;

      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.products)) return data.products;

      return [];
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Erreur de recherche"
      );
    }
  }
);

const productSlice = createSlice({
  name: "products",
  initialState: {
    items: [], // ✅ toujours tableau
    currentProduct: null,
    searchResults: [],
    isLoading: false,
    error: null
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
    },

    resetProducts: (state) => {
      state.items = [];
      state.currentProduct = null;
      state.searchResults = [];
      state.error = null;
    }
  },

  extraReducers: (builder) => {
    builder
      // ✅ Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.items = [];
      })

      // ✅ Fetch Product By ID
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
      })

      // ✅ Search Products
      .addCase(searchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = Array.isArray(action.payload)
          ? action.payload
          : [];
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.searchResults = [];
      });
  }
});

export const {
  clearError,
  clearCurrentProduct,
  clearSearchResults,
  resetProducts
} = productSlice.actions;

export default productSlice.reducer;
