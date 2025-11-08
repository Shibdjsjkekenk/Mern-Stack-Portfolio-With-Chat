import { createSlice } from "@reduxjs/toolkit";

const experienceSlice = createSlice({
  name: "experience",
  initialState: {
    experiences: [],       // ✅ All experiences
    selectedExperience: null, // ✅ Single selected experience
    loading: false,
    error: null,
  },
  reducers: {
    setExperiences: (state, action) => {
      state.experiences = action.payload;
    },
    addExperience: (state, action) => {
      state.experiences.push(action.payload);
    },
    updateExperience: (state, action) => {
      const idx = state.experiences.findIndex(e => e._id === action.payload._id);
      if (idx !== -1) state.experiences[idx] = action.payload;
    },
    removeExperience: (state, action) => {
      state.experiences = state.experiences.filter(e => e._id !== action.payload);
    },
    setSelectedExperience: (state, action) => {
      state.selectedExperience = action.payload;
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
  setExperiences, addExperience, updateExperience,
  removeExperience, setSelectedExperience, setLoading, setError 
} = experienceSlice.actions;

export default experienceSlice.reducer;
