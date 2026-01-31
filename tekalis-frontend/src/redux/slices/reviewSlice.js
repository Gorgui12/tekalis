import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";

// Thunks asynchrones
export const fetchReviews = createAsyncThunk(
  "reviews/fetchReviews",
  async (productId) => {
    const { data } = await api.get(`/reviews/product/${productId}`);
    return data;
  }
);

export const addReview = createAsyncThunk(
  "reviews/addReview",
  async (reviewData) => {
    const { data } = await api.post("/reviews", reviewData);
    return data;
  }
);

export const updateReview = createAsyncThunk(
  "reviews/updateReview",
  async ({ reviewId, reviewData }) => {
    const { data } = await api.put(`/reviews/${reviewId}`, reviewData);
    return data;
  }
);

export const deleteReview = createAsyncThunk(
  "reviews/deleteReview",
  async (reviewId) => {
    await api.delete(`/reviews/${reviewId}`);
    return reviewId;
  }
);

export const likeReview = createAsyncThunk(
  "reviews/likeReview",
  async (reviewId) => {
    const { data } = await api.post(`/reviews/${reviewId}/like`);
    return data;
  }
);

const reviewSlice = createSlice({
  name: "reviews",
  initialState: {
    reviews: [],
    userReviews: [],
    productReviews: {},
    stats: {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    },
    loading: false,
    error: null
  },
  reducers: {
    clearReviews: (state) => {
      state.reviews = [];
      state.error = null;
    },
    setProductReviews: (state, action) => {
      const { productId, reviews } = action.payload;
      state.productReviews[productId] = reviews;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch reviews
      .addCase(fetchReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload.reviews;
        state.stats = action.payload.stats;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Add review
      .addCase(addReview.pending, (state) => {
        state.loading = true;
      })
      .addCase(addReview.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews.unshift(action.payload.review);
        state.stats = action.payload.stats;
      })
      .addCase(addReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Update review
      .addCase(updateReview.fulfilled, (state, action) => {
        const index = state.reviews.findIndex(r => r._id === action.payload.review._id);
        if (index !== -1) {
          state.reviews[index] = action.payload.review;
        }
      })
      
      // Delete review
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.reviews = state.reviews.filter(r => r._id !== action.payload);
      })
      
      // Like review
      .addCase(likeReview.fulfilled, (state, action) => {
        const index = state.reviews.findIndex(r => r._id === action.payload.review._id);
        if (index !== -1) {
          state.reviews[index] = action.payload.review;
        }
      });
  }
});

export const { clearReviews, setProductReviews } = reviewSlice.actions;
export default reviewSlice.reducer;