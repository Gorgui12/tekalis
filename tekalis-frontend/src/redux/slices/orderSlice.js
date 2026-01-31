import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../api/api"; // Modifie selon ton setup

// 🔥 Récupérer les commandes de l'utilisateur
export const fetchUserOrders = createAsyncThunk("orders/fetchUserOrders", async (_, { rejectWithValue }) => {
  try {
    const { data } = await axios.get("/orders/my-orders");
    return data;
  } catch (error) {
    return rejectWithValue(error.response.data.message);
  }
});

// 🔥 Créer une commande
export const createOrder = createAsyncThunk("orders/createOrder", async (orderData, { rejectWithValue }) => {
  try {
    const { data } = await axios.post("/orders", orderData);
    console.log("🟢 Résultat createOrder :", data); // Ajoute ceci
    return data;
  } catch (error) {
    console.log("🔴 Erreur createOrder :", error.response.data.message);
    return rejectWithValue(error.response.data.message);
  }
});

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    orders: [],
    order: null,
    orderId: null, // Ajoute ceci
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
        state.orderId = action.payload._id; // Enregistre l’ID de la commande ici
      });

  },
});

export default orderSlice.reducer;
