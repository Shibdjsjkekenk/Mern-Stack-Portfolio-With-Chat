import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  timelineList: [],
  selectedTimeline: null,
  loading: false,
  error: null,
};

const timelineSlice = createSlice({
  name: "timeline",
  initialState,
  reducers: {
    setTimelineList: (state, action) => {
      state.timelineList = action.payload;
    },
    addTimeline: (state, action) => {
      state.timelineList.unshift(action.payload);
    },
    updateTimeline: (state, action) => {
      state.timelineList = state.timelineList.map((item) =>
        item._id === action.payload._id ? action.payload : item
      );
    },
    removeTimeline: (state, action) => {
      state.timelineList = state.timelineList.filter(
        (item) => item._id !== action.payload
      );
    },
    setSelectedTimeline: (state, action) => {
      state.selectedTimeline = action.payload;
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
  setTimelineList,
  addTimeline,
  updateTimeline,
  removeTimeline,
  setSelectedTimeline,
  setLoading,
  setError,
} = timelineSlice.actions;

export default timelineSlice.reducer;
