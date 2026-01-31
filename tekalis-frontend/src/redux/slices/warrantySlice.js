import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";

// Thunks asynchrones
export const fetchWarranties = createAsyncThunk(
  "warranties/fetchWarranties",
  async () => {
    const { data } = await api.get("/warranties");
    return data;
  }
);

export const fetchWarrantyById = createAsyncThunk(
  "warranties/fetchWarrantyById",
  async (warrantyId) => {
    const { data } = await api.get(`/warranties/${warrantyId}`);
    return data;
  }
);

export const extendWarranty = createAsyncThunk(
  "warranties/extendWarranty",
  async ({ warrantyId, extensionData }) => {
    const { data } = await api.post(`/warranties/${warrantyId}/extend`, extensionData);
    return data;
  }
);

export const claimWarranty = createAsyncThunk(
  "warranties/claimWarranty",
  async ({ warrantyId, claimData }) => {
    const { data } = await api.post(`/warranties/${warrantyId}/claim`, claimData);
    return data;
  }
);

const warrantySlice = createSlice({
  name: "warranties",
  initialState: {
    warranties: [],
    currentWarranty: null,
    stats: {
      active: 0,
      expiring: 0,
      expired: 0
    },
    loading: false,
    error: null
  },
  reducers: {
    clearWarranties: (state) => {
      state.warranties = [];
      state.error = null;
    },
    setCurrentWarranty: (state, action) => {
      state.currentWarranty = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWarranties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWarranties.fulfilled, (state, action) => {
        state.loading = false;
        state.warranties = action.payload.warranties;
        state.stats = action.payload.stats;
      })
      .addCase(fetchWarranties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchWarrantyById.fulfilled, (state, action) => {
        state.currentWarranty = action.payload.warranty;
      })
      .addCase(extendWarranty.fulfilled, (state, action) => {
        const index = state.warranties.findIndex(w => w._id === action.payload.warranty._id);
        if (index !== -1) {
          state.warranties[index] = action.payload.warranty;
        }
        if (state.currentWarranty?._id === action.payload.warranty._id) {
          state.currentWarranty = action.payload.warranty;
        }
      })
      .addCase(claimWarranty.fulfilled, (state, action) => {
        const index = state.warranties.findIndex(w => w._id === action.payload.warranty._id);
        if (index !== -1) {
          state.warranties[index] = action.payload.warranty;
        }
      });
  }
});

export const { clearWarranties, setCurrentWarranty } = warrantySlice.actions;
export default warrantySlice.reducer;