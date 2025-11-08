// src/store/chatAuthSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  token: localStorage.getItem("token") || null,
  loading: false,
  error: null,
  message: null,
};

const chatAuthSlice = createSlice({
  name: "chatAuth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
      if (action.payload) {
        localStorage.setItem("token", action.payload);
      } else {
        localStorage.removeItem("token");
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setMessage: (state, action) => {
      state.message = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
      state.message = "Logged out successfully!";
    },
  },
});

export const {
  setUser,
  setToken,
  setLoading,
  setError,
  setMessage,
  clearError,
  clearMessage,
  logout,
} = chatAuthSlice.actions;

export default chatAuthSlice.reducer;
