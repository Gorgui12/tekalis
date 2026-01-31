import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";

export const fetchRMAs = createAsyncThunk(
  "rma/fetchRMAs",
  async () => {
    const { data } = await api.get("/rma");
    return data;
  }
);

export const fetchRMAById = createAsyncThunk(
  "rma/fetchRMAById",
  async (rmaId) => {
    const { data } = await api.get(`/rma/${rmaId}`);
    return data;
  }
);

export const createRMA = createAsyncThunk(
  "rma/createRMA",
  async (rmaData) => {
    const { data } = await api.post("/rma", rmaData);
    return data;
  }
);

export const updateRMAStatus = createAsyncThunk(
  "rma/updateRMAStatus",
  async ({ rmaId, status }) => {
    const { data } = await api.put(`/rma/${rmaId}/status`, { status });
    return data;
  }
);

export const addRMAComment = createAsyncThunk(
  "rma/addRMAComment",
  async ({ rmaId, comment }) => {
    const { data } = await api.post(`/rma/${rmaId}/comments`, { comment });
    return data;
  }
);

export const cancelRMA = createAsyncThunk(
  "rma/cancelRMA",
  async (rmaId) => {
    const { data } = await api.delete(`/rma/${rmaId}`);
    return data;
  }
);

const rmaSlice = createSlice({
  name: "rma",
  initialState: {
    rmas: [],
    currentRMA: null,
    stats: { open: 0, inProgress: 0, resolved: 0, closed: 0 },
    loading: false,
    error: null
  },
  reducers: {
    clearRMAs: (state) => {
      state.rmas = [];
      state.error = null;
    },
    setCurrentRMA: (state, action) => {
      state.currentRMA = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRMAs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRMAs.fulfilled, (state, action) => {
        state.loading = false;
        state.rmas = action.payload.rmas;
        state.stats = action.payload.stats;
      })
      .addCase(fetchRMAs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchRMAById.fulfilled, (state, action) => {
        state.currentRMA = action.payload.rma;
      })
      .addCase(createRMA.pending, (state) => {
        state.loading = true;
      })
      .addCase(createRMA.fulfilled, (state, action) => {
        state.loading = false;
        state.rmas.unshift(action.payload.rma);
        state.currentRMA = action.payload.rma;
      })
      .addCase(createRMA.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(updateRMAStatus.fulfilled, (state, action) => {
        const index = state.rmas.findIndex(r => r._id === action.payload.rma._id);
        if (index !== -1) {
          state.rmas[index] = action.payload.rma;
        }
        if (state.currentRMA?._id === action.payload.rma._id) {
          state.currentRMA = action.payload.rma;
        }
      })
      .addCase(addRMAComment.fulfilled, (state, action) => {
        if (state.currentRMA?._id === action.payload.rma._id) {
          state.currentRMA = action.payload.rma;
        }
      })
      .addCase(cancelRMA.fulfilled, (state, action) => {
        state.rmas = state.rmas.filter(r => r._id !== action.payload.rmaId);
        if (state.currentRMA?._id === action.payload.rmaId) {
          state.currentRMA = null;
        }
      });
  }
});

export const { clearRMAs, setCurrentRMA } = rmaSlice.actions;
export default rmaSlice.reducer;