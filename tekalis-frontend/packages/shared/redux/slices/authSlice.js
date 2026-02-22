import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../../packages/shared/api/api";

// 🔥 Login
export const loginUser = createAsyncThunk("auth/loginUser", async (userData, thunkAPI) => {
  try {
    const res = await api.post("/auth/login", userData);
    const { token, user } = res.data;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    
    // Configurer le header Authorization pour les futures requêtes
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    return { token, user };
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Erreur de connexion");
  }
});

// 🔥 Register
export const registerUser = createAsyncThunk("auth/registerUser", async (userData, thunkAPI) => {
  try {
    const res = await api.post("/auth/register", userData);
    const { token, user } = res.data;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    return { token, user };
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Erreur d'inscription");
  }
});

// 🔥 Update profile
export const updateProfile = createAsyncThunk("auth/updateProfile", async (userData, thunkAPI) => {
  try {
    const res = await api.put("/users/me", userData);
    const user = res.data.user || res.data;
    
    localStorage.setItem("user", JSON.stringify(user));
    
    return user;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Erreur de mise à jour");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: localStorage.getItem("token") || null,
    user: JSON.parse(localStorage.getItem("user") || "null"),
    isLoading: false,
    error: null,
  },
  reducers: {
    // 🔥 Logout
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      delete api.defaults.headers.common["Authorization"];
    },
    
    // 🔥 Set user (pour mise à jour manuelle)
    setUser: (state, action) => {
      state.user = action.payload;
      if (action.payload) {
        localStorage.setItem("user", JSON.stringify(action.payload));
      }
    },
    
    // 🔥 Clear user (déconnexion sans appel API)
    clearUser: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    
    // 🔥 Clear error
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.token = null;
        state.user = null;
      })
      
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, setUser, clearUser, clearError } = authSlice.actions;
export default authSlice.reducer;