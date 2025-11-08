// src/redux/slices/bannerSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  bannerList: [],
  selectedBanner: null,
  loading: false,
  error: null,
};

const bannerSlice = createSlice({
  name: "banner",
  initialState,
  reducers: {
    setBannerList: (state, action) => {
      state.bannerList = action.payload;
    },
    addBanner: (state, action) => {
      state.bannerList.unshift(action.payload);
    },
    updateBanner: (state, action) => {
      state.bannerList = state.bannerList.map((item) =>
        item._id === action.payload._id ? action.payload : item
      );
    },
    removeBanner: (state, action) => {
      state.bannerList = state.bannerList.filter(
        (item) => item._id !== action.payload
      );
    },
    setSelectedBanner: (state, action) => {
      state.selectedBanner = action.payload;
    },
    setBannerLoading: (state, action) => {
      state.loading = action.payload;
    },
    setBannerError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setBannerList,
  addBanner,
  updateBanner,
  removeBanner,
  setSelectedBanner,
  setBannerLoading,
  setBannerError,
} = bannerSlice.actions;

export default bannerSlice.reducer;
