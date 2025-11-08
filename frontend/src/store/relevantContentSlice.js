// src/redux/slices/relevantContentSlice.js
import { createSlice } from "@reduxjs/toolkit";

const relevantContentSlice = createSlice({
  name: "relevantContent",
  initialState: {
    relevantContents: [],        // ✅ All relevant contents
    selectedRelevantContent: null, // ✅ Single selected relevant content
    loading: false,
    error: null,
  },
  reducers: {
    setRelevantContents: (state, action) => {
      state.relevantContents = action.payload;
    },
    addRelevantContent: (state, action) => {
      state.relevantContents.push(action.payload);
    },
    updateRelevantContent: (state, action) => {
      const idx = state.relevantContents.findIndex(
        (c) => c._id === action.payload._id
      );
      if (idx !== -1) state.relevantContents[idx] = action.payload;
    },
    removeRelevantContent: (state, action) => {
      state.relevantContents = state.relevantContents.filter(
        (c) => c._id !== action.payload
      );
    },
    setSelectedRelevantContent: (state, action) => {
      state.selectedRelevantContent = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setRelevantContents,
  addRelevantContent,
  updateRelevantContent,
  removeRelevantContent,
  setSelectedRelevantContent,
  setLoading,
  setError,
} = relevantContentSlice.actions;

export default relevantContentSlice.reducer;
