import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../../packages/shared/api/api";

export const fetchArticles = createAsyncThunk(
  "articles/fetchArticles",
  async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const { data } = await api.get(`/articles?${queryString}`);
    return data;
  }
);

export const fetchArticleById = createAsyncThunk(
  "articles/fetchArticleById",
  async (articleId) => {
    const { data } = await api.get(`/articles/${articleId}`);
    return data;
  }
);

export const fetchArticleBySlug = createAsyncThunk(
  "articles/fetchArticleBySlug",
  async (slug) => {
    const { data } = await api.get(`/api/v1/articles/slug/${slug}`);
    return data;
  }
);

export const createArticle = createAsyncThunk(
  "articles/createArticle",
  async (articleData) => {
    const { data } = await api.post("/admin/articles", articleData);
    return data;
  }
);

export const updateArticle = createAsyncThunk(
  "articles/updateArticle",
  async ({ articleId, articleData }) => {
    const { data } = await api.put(`/admin/articles/${articleId}`, articleData);
    return data;
  }
);

export const deleteArticle = createAsyncThunk(
  "articles/deleteArticle",
  async (articleId) => {
    await api.delete(`/admin/articles/${articleId}`);
    return articleId;
  }
);

export const incrementViews = createAsyncThunk(
  "articles/incrementViews",
  async (articleId) => {
    const { data } = await api.post(`/articles/${articleId}/view`);
    return data;
  }
);

const articleSlice = createSlice({
  name: "articles",
  initialState: {
    articles: [],
    currentArticle: null,
    featuredArticles: [],
    relatedArticles: [],
    loading: false,
    error: null
  },
  reducers: {
    clearArticles: (state) => {
      state.articles = [];
      state.error = null;
    },
    setCurrentArticle: (state, action) => {
      state.currentArticle = action.payload;
    },
    setFeaturedArticles: (state, action) => {
      state.featuredArticles = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchArticles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArticles.fulfilled, (state, action) => {
        state.loading = false;
        state.articles = action.payload.articles;
        state.featuredArticles = action.payload.featured || [];
      })
      .addCase(fetchArticles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchArticleById.fulfilled, (state, action) => {
        state.currentArticle = action.payload.article;
        state.relatedArticles = action.payload.related || [];
      })
      .addCase(fetchArticleBySlug.fulfilled, (state, action) => {
        state.currentArticle = action.payload.article;
        state.relatedArticles = action.payload.related || [];
      })
      .addCase(createArticle.fulfilled, (state, action) => {
        state.articles.unshift(action.payload.article);
      })
      .addCase(updateArticle.fulfilled, (state, action) => {
        const index = state.articles.findIndex(a => a._id === action.payload.article._id);
        if (index !== -1) {
          state.articles[index] = action.payload.article;
        }
        if (state.currentArticle?._id === action.payload.article._id) {
          state.currentArticle = action.payload.article;
        }
      })
      .addCase(deleteArticle.fulfilled, (state, action) => {
        state.articles = state.articles.filter(a => a._id !== action.payload);
      })
      .addCase(incrementViews.fulfilled, (state, action) => {
        if (state.currentArticle?._id === action.payload.article._id) {
          state.currentArticle.views = action.payload.article.views;
        }
      });
  }
});

export const { clearArticles, setCurrentArticle, setFeaturedArticles } = articleSlice.actions;
export default articleSlice.reducer;