import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  aboutUsList: [],
  selectedAboutUs: null,
  loading: false,
  error: null,
};

const aboutUsSlice = createSlice({
  name: "aboutUs",
  initialState,
  reducers: {
    setAboutUsList: (state, action) => {
      state.aboutUsList = action.payload;
    },
    addAboutUs: (state, action) => {
      state.aboutUsList.unshift(action.payload);
    },
    updateAboutUs: (state, action) => {
      state.aboutUsList = state.aboutUsList.map((item) =>
        item._id === action.payload._id ? action.payload : item
      );
    },
    removeAboutUs: (state, action) => {
      state.aboutUsList = state.aboutUsList.filter(
        (item) => item._id !== action.payload
      );
    },
    setSelectedAboutUs: (state, action) => {
      state.selectedAboutUs = action.payload;
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
  setAboutUsList,
  addAboutUs,
  updateAboutUs,
  removeAboutUs,
  setSelectedAboutUs,
  setLoading,
  setError,
} = aboutUsSlice.actions;

export default aboutUsSlice.reducer;
