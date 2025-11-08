import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    messages: [],        // sabhi chat messages (user + admin)
    activeChat: null,    // current active chat user (admin view ke liye)
    unreadCount: 0,      // unread messages ka count
    loading: false,      // for API or socket events
  },
  reducers: {
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setActiveChat: (state, action) => {
      state.activeChat = action.payload;
    },
    incrementUnread: (state) => {
      state.unreadCount += 1;
    },
    resetUnread: (state) => {
      state.unreadCount = 0;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
      state.unreadCount = 0;
    },
  },
});

export const {
  setMessages,
  addMessage,
  setActiveChat,
  incrementUnread,
  resetUnread,
  setLoading,
  clearMessages,
} = chatSlice.actions;

export default chatSlice.reducer;
