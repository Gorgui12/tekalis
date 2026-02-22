import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../../packages/shared/api/api";

export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async () => {
    const { data } = await api.get("/categories");
    return data;
  }
);

export const fetchCategoryById = createAsyncThunk(
  "categories/fetchCategoryById",
  async (categoryId) => {
    const { data } = await api.get(`/categories/${categoryId}`);
    return data;
  }
);

export const fetchCategoryBySlug = createAsyncThunk(
  "categories/fetchCategoryBySlug",
  async (slug) => {
    const { data } = await api.get(`/categories/slug/${slug}`);
    return data;
  }
);

export const createCategory = createAsyncThunk(
  "categories/createCategory",
  async (categoryData) => {
    const { data } = await api.post("/admin/categories", categoryData);
    return data;
  }
);

export const updateCategory = createAsyncThunk(
  "categories/updateCategory",
  async ({ categoryId, categoryData }) => {
    const { data } = await api.put(`/admin/categories/${categoryId}`, categoryData);
    return data;
  }
);

export const deleteCategory = createAsyncThunk(
  "categories/deleteCategory",
  async (categoryId) => {
    await api.delete(`/admin/categories/${categoryId}`);
    return categoryId;
  }
);

const categorySlice = createSlice({
  name: "categories",
  initialState: {
    categories: [],
    currentCategory: null,
    loading: false,
    error: null
  },
  reducers: {
    clearCategories: (state) => {
      state.categories = [];
      state.error = null;
    },
    setCurrentCategory: (state, action) => {
      state.currentCategory = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.categories;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.currentCategory = action.payload.category;
      })
      .addCase(fetchCategoryBySlug.fulfilled, (state, action) => {
        state.currentCategory = action.payload.category;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload.category);
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.categories.findIndex(c => c._id === action.payload.category._id);
        if (index !== -1) {
          state.categories[index] = action.payload.category;
        }
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter(c => c._id !== action.payload);
      });
  }
});

export const { clearCategories, setCurrentCategory } = categorySlice.actions;
export default categorySlice.reducer;