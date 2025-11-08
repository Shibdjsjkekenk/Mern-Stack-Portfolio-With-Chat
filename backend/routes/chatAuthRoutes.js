const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload.js"); // ✅ import upload function

const {
  chatSignupController,
  chatSendOtpController,
  chatVerifyOtpController,
  chatLoginController,
  chatLogoutController,
} = require("../controller/chat/chatAuthController.js");

// --------------------- CHAT AUTH ROUTES ---------------------

// 🟢 Signup with optional profile picture upload (stored in uploads/profiles)
router.post("/signup", upload("profiles"), chatSignupController);

// 🟡 Send OTP to email
router.post("/send-otp", chatSendOtpController);

// 🟢 Verify OTP
router.post("/verify-otp", chatVerifyOtpController);

// 🔵 Login with email & password
router.post("/login", chatLoginController);

// 🔴 Logout
router.post("/logout", chatLogoutController);

module.exports = router;
