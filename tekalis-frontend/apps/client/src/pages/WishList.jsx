import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../../packages/shared/api/api";

// Même sanitisation que cartSlice
const sanitizeProduct = (product) => ({
  _id: product._id,
  name: product.name,
  price: product.price,
  comparePrice: product.comparePrice || null,
  stock: product.stock,
  brand: product.brand || "",
  images: product.images || [],
  image: product.image || null,
  specs: product.specs || {},
  rating: product.rating || { average: 0, count: 0 },
  // ✅ category : on ne garde que le nom (string)
  category: Array.isArray(product.category)
    ? product.category.map((c) => (typeof c === "object" ? c.name : c))
    : typeof product.category === "object" && product.category !== null
    ? [product.category.name]
    : product.category
    ? [product.category]
    : [],
});

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
    const id = typeof productId === "object" ? productId._id : productId;
    const { data } = await api.post("/wishlist", { productId: id });
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
    error: null,
  },
  reducers: {
    resetWishlist: (state) => {
      state.items = [];
      state.error = null;
    },
    // ✅ Action synchrone pour ajout local immédiat (optimistic update)
    addToWishlistLocal: (state, action) => {
      const product = sanitizeProduct(action.payload);
      const exists = state.items.some((item) => item._id === product._id);
      if (!exists) {
        state.items.push(product);
      }
    },
    removeFromWishlistLocal: (state, action) => {
      state.items = state.items.filter((item) => item._id !== action.payload);
    },
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
        // Sanitiser les items venant de l'API aussi
        state.items = (action.payload.items || []).map(sanitizeProduct);
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
        if (action.payload.item) {
          state.items.push(sanitizeProduct(action.payload.item));
        }
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Remove from wishlist
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
      })

      // Clear wishlist
      .addCase(clearWishlist.fulfilled, (state) => {
        state.items = [];
      });
  },
});

export const { resetWishlist, addToWishlistLocal, removeFromWishlistLocal } =
  wishListSlice.actions;
export default wishListSlice.reducer;