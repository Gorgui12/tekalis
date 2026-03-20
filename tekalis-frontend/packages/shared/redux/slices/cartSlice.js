import { createSlice } from "@reduxjs/toolkit";

// Sanitise un produit avant de le stocker dans Redux
// Évite l'erreur "Objects are not valid as a React child"
// quand category est un tableau d'objets {_id, name, slug}
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
  warranty: product.warranty || null,
  // ✅ category : on ne garde que le nom (string) pour éviter le crash
  category: Array.isArray(product.category)
    ? product.category.map((c) => (typeof c === "object" ? c.name : c))
    : typeof product.category === "object" && product.category !== null
    ? [product.category.name]
    : product.category
    ? [product.category]
    : [],
});

const initialState = {
  items: [],
  totalAmount: 0,
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const product = sanitizeProduct(action.payload);
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

      if (existingItem) {
        if (existingItem.quantity > 1) {
          existingItem.quantity -= 1;
          state.totalAmount -= existingItem.price;
        } else {
          // ✅ Fix bug original : on soustrait AVANT de filtrer
          state.totalAmount -= existingItem.price;
          state.items = state.items.filter((item) => item._id !== productId);
        }
      }
    },

    clearCart: (state) => {
      state.items = [];
      state.totalAmount = 0;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;