import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/api';

export const loginUser = createAsyncThunk('auth/login', async (data, thunk) => {
  try {
    const res = await api.post('/auth/login', data);
    const { token, user } = res.data;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
    return { token, user };
  } catch (e) {
    return thunk.rejectWithValue(e.response?.data?.message || 'Erreur connexion');
  }
});

export const registerUser = createAsyncThunk('auth/register', async (data, thunk) => {
  try {
    const res = await api.post('/auth/register', data);
    const { token, user } = res.data;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
    return { token, user };
  } catch (e) {
    return thunk.rejectWithValue(e.response?.data?.message || "Erreur inscription");
  }
});

const getInitialState = () => {
  if (typeof window === 'undefined') return { user: null, token: null, isLoading: false, error: null };
  return {
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token') || null,
    isLoading: false,
    error: null,
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    },
    setUser(state, action) {
      state.user = action.payload;
    },
  },
  extraReducers: (b) => {
    b.addCase(loginUser.pending, (s) => { s.isLoading = true; s.error = null; })
     .addCase(loginUser.fulfilled, (s, a) => { s.isLoading = false; s.token = a.payload.token; s.user = a.payload.user; })
     .addCase(loginUser.rejected, (s, a) => { s.isLoading = false; s.error = a.payload; })
     .addCase(registerUser.pending, (s) => { s.isLoading = true; s.error = null; })
     .addCase(registerUser.fulfilled, (s, a) => { s.isLoading = false; s.token = a.payload.token; s.user = a.payload.user; })
     .addCase(registerUser.rejected, (s, a) => { s.isLoading = false; s.error = a.payload; });
  },
});

export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;