import { createSlice } from "@reduxjs/toolkit";

const projectSlice = createSlice({
  name: "project",
  initialState: {
    projects: [],
    selectedProject: null,
    loading: false,
    error: null,
  },
  reducers: {
    // ✅ Set all projects (after fetch)
    setProjects: (state, action) => {
      state.projects = action.payload;
    },

    // ✅ Add new project
    addProject: (state, action) => {
      state.projects.push(action.payload);
    },

    // ✅ Update entire project
    updateProject: (state, action) => {
      const idx = state.projects.findIndex(p => p._id === action.payload._id);
      if (idx !== -1) state.projects[idx] = action.payload;
    },

    // ✅ Update only status (for instant dropdown updates)
    updateProjectStatus: (state, action) => {
      const { id, status } = action.payload;
      const idx = state.projects.findIndex(p => p._id === id);
      if (idx !== -1) {
        state.projects[idx].status = status;
      }
    },

    // ✅ Remove project
    removeProject: (state, action) => {
      state.projects = state.projects.filter(p => p._id !== action.payload);
    },

    // ✅ Select project for edit/view
    setSelectedProject: (state, action) => {
      state.selectedProject = action.payload;
    },

    // ✅ Loading & error
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { 
  setProjects, addProject, updateProject, 
  updateProjectStatus, removeProject, 
  setSelectedProject, setLoading, setError 
} = projectSlice.actions;

export default projectSlice.reducer;
