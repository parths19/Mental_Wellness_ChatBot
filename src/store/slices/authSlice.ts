import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../utils/axios';
import { connectSocket, disconnectSocket } from '../../utils/socket';

interface User {
  id: string;
  email: string;
  name: string;
  preferences?: {
    theme?: 'light' | 'dark';
    notifications?: boolean;
    language?: string;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,
};

// Initialize socket connection if token exists
const storedToken = localStorage.getItem('token');
if (storedToken) {
  console.log('Initializing socket with stored token');
  connectSocket(storedToken);
}

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }) => {
    const response = await api.post('/api/auth/login', credentials);
    const { token, user } = response.data.data;
    
    // Validate token
    if (!token) {
      throw new Error('No token received from server');
    }

    console.log('Login successful, storing token');
    localStorage.setItem('token', token);
    
    // Initialize socket connection
    console.log('Connecting socket after login');
    connectSocket(token);
    
    return { token, user };
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: { email: string; password: string; name: string }) => {
    const response = await api.post('/api/auth/register', userData);
    const { token, user } = response.data.data;
    
    // Validate token
    if (!token) {
      throw new Error('No token received from server');
    }

    console.log('Registration successful, storing token');
    localStorage.setItem('token', token);
    
    // Initialize socket connection
    console.log('Connecting socket after registration');
    connectSocket(token);
    
    return { token, user };
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  console.log('Logging out, removing token');
  localStorage.removeItem('token');
  disconnectSocket();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      console.log('Setting credentials, storing token');
      localStorage.setItem('token', action.payload.token);
      connectSocket(action.payload.token);
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      console.log('Clearing credentials, removing token');
      localStorage.removeItem('token');
      disconnectSocket();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Login failed';
        // Clear any existing token on login failure
        state.token = null;
        localStorage.removeItem('token');
        disconnectSocket();
      })
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Registration failed';
        // Clear any existing token on registration failure
        state.token = null;
        localStorage.removeItem('token');
        disconnectSocket();
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.error = null;
      });
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer; 