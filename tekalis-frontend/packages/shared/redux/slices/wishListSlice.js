import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../../packages/shared/api/api";

// Thunks asynchrones
export const fetchWishlist = createAsyncThunk(
  "wishlist/fetchWishlist",
  async () => {
    const { data } = await api.get("/wishlist");
    return data;
  }
);

export const addToWishlist = createAsyncThunk(
  "wishlist/addToWishlist",
  async (productId) => {
    const { data } = await api.post("/wishlist", { productId });
    return data;
  }
);

export const removeFromWishlist = createAsyncThunk(
  "wishlist/removeFromWishlist",
  async (productId) => {
    await api.delete(`/wishlist/${productId}`);
    return productId;
  }
);

export const clearWishlist = createAsyncThunk(
  "wishlist/clearWishlist",
  async () => {
    await api.delete("/wishlist");
    return [];
  }
);

const wishListSlice = createSlice({
  name: "wishlist",
  initialState: {
    items: [],
    loading: false,
    error: null
  },
  reducers: {
    resetWishlist: (state) => {
      state.items = [];
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch wishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Add to wishlist
      .addCase(addToWishlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload.item);
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Remove from wishlist
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item._id !== action.payload);
      })
      
      // Clear wishlist
      .addCase(clearWishlist.fulfilled, (state) => {
        state.items = [];
      });
  }
});

export const { resetWishlist } = wishListSlice.actions;
export default wishListSlice.reducer;