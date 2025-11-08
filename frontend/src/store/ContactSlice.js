// src/redux/slices/contactSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  contacts: [],
  loading: false,
  error: null,
  selectedContact: null,
  unreadCount: 0, // ✅ Track unread contacts
};

const contactSlice = createSlice({
  name: "contact",
  initialState,
  reducers: {
    // ✅ Set all contacts and calculate unread count
    setContactList: (state, action) => {
      state.contacts = action.payload;
      state.unreadCount = action.payload.filter((c) => !c.read).length;
    },

    // ✅ Add new contact and increment unread count if unread
    addContact: (state, action) => {
      state.contacts.push(action.payload);
      if (!action.payload.read) state.unreadCount += 1;
    },

    // ✅ Mark all contacts as read
    markContactsAsRead: (state) => {
      state.contacts = state.contacts.map((c) => ({ ...c, read: true }));
      state.unreadCount = 0;
    },

    // ✅ Remove a contact by id
    removeContact: (state, action) => {
      const removed = state.contacts.find((c) => c._id === action.payload);
      if (removed && !removed.read) state.unreadCount -= 1;
      state.contacts = state.contacts.filter((c) => c._id !== action.payload);
    },

    // ✅ Update a contact
    updateContact: (state, action) => {
      const index = state.contacts.findIndex(
        (c) => c._id === action.payload._id
      );
      if (index !== -1) {
        // Adjust unread count if read status changed
        if (state.contacts[index].read && !action.payload.read)
          state.unreadCount += 1;
        if (!state.contacts[index].read && action.payload.read)
          state.unreadCount -= 1;

        state.contacts[index] = action.payload;
      }
    },

    // ✅ Send reply to a contact (frontend state only)
    replyToContact: (state, action) => {
      const index = state.contacts.findIndex(
        (c) => c._id === action.payload._id
      );
      if (index !== -1) {
        state.contacts[index].reply = action.payload.reply; // save reply text
      }
    },

    // ✅ Loading and error state
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },

    // ✅ Select a single contact
    setSelectedContact: (state, action) => {
      state.selectedContact = action.payload;
    },
  },
});

export const {
  setContactList,
  addContact,
  removeContact,
  updateContact,
  markContactsAsRead,
  replyToContact,
  setLoading,
  setError,
  setSelectedContact,
} = contactSlice.actions;

export default contactSlice.reducer;
