const express = require("express");
const router = express.Router();
const {
  sendMessage,
  getMessages,
  getChatUsers, // 🆕 Existing controller for user list
  getChatSummary, // 🆕 Newly added summary controller
  markMessagesRead, // ✅ FIXED: match exact export name from controller
} = require("../controller/chat/chatController"); // ✅ Correct import path

// ---------------------- 💬 Chat Routes ----------------------

// ✅ 1️⃣ Send message (used by frontend & socket)
router.post("/send", sendMessage);

// ✅ 2️⃣ Get chat history between ChatUser & Admin
// Example: GET /api/chat/messages/:userId/:adminId
router.get("/messages/:userId/:adminId", getMessages);

// ✅ 3️⃣ Get all users who have chatted with Admin
// Example: GET /api/chat/users
router.get("/users", getChatUsers);

// ✅ 4️⃣ Get chat summary for admin (last message + unread count)
// Example: GET /api/chat/summary/:adminId
router.get("/summary/:adminId", getChatSummary);

// ✅ 5️⃣ Mark messages as read when admin opens chat
// Example: PUT /api/chat/read/:userId/:adminId
router.put("/read/:userId/:adminId", markMessagesRead);

module.exports = router;
