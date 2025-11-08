import { createSlice } from "@reduxjs/toolkit";

const relevantProjectSlice = createSlice({
  name: "relevantProject",
  initialState: {
    relevantProjects: [],    // ✅ Relevant projects list
    selectedRelevantProject: null, // ✅ Single selected relevant project
    loading: false,
    error: null,
  },
  reducers: {
    setRelevantProjects: (state, action) => {
      state.relevantProjects = action.payload;
    },
    addRelevantProject: (state, action) => {
      state.relevantProjects.push(action.payload);
    },
    updateRelevantProject: (state, action) => {
      const idx = state.relevantProjects.findIndex(
        (p) => p._id === action.payload._id
      );
      if (idx !== -1) state.relevantProjects[idx] = action.payload;
    },
    removeRelevantProject: (state, action) => {
      state.relevantProjects = state.relevantProjects.filter(
        (p) => p._id !== action.payload
      );
    },
    setSelectedRelevantProject: (state, action) => {
      state.selectedRelevantProject = action.payload;
    },
    setRelevantProjectLoading: (state, action) => {
      state.loading = action.payload;
    },
    setRelevantProjectError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setRelevantProjects,
  addRelevantProject,
  updateRelevantProject,
  removeRelevantProject,
  setSelectedRelevantProject,
  setRelevantProjectLoading,
  setRelevantProjectError,
} = relevantProjectSlice.actions;

export default relevantProjectSlice.reducer;
