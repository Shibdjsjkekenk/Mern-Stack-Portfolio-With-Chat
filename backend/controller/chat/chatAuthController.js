// =============================================================
// ✅ controller/chat/chatAuthController.js — Updated with Presence Logic
// =============================================================
const ChatUser = require("../../models/ChatUserModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const fs = require("fs").promises;
const path = require("path");
const { io } = require("../socket/initSocket"); // ✅ import socket instance

// --------------------- HELPER: SEND OTP VIA EMAIL ---------------------
const sendOtpEmailHelper = async (email, otp) => {
  try {
    console.log("📧 Sending OTP to:", email);

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 10000, // ✅ Stop hanging after 10s
    });

    const info = await transporter.sendMail({
      from: `"T'Chat App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Chat Login OTP",
      html: `
        <div style="font-family: Arial; color: #333;">
          <h2>🔐 OTP Verification</h2>
          <p>Your OTP is <b>${otp}</b>. It expires in <b>5 minutes</b>.</p>
        </div>
      `,
    });

    console.log("✅ OTP Email sent successfully:", info.response);
  } catch (err) {
    console.error("❌ OTP Send Error:", err.message);
    throw new Error("Failed to send OTP email — check SMTP access or credentials.");
  }
};


// --------------------- HELPER: SAVE BASE64 IMAGE ---------------------
const saveBase64Image = async (base64String) => {
  try {
    const matches = base64String.match(/^data:(.+);base64,(.+)$/);
    if (!matches) return "";

    const mimeType = matches[1];
    const ext = mimeType.split("/")[1];
    const allowed = ["png", "jpg", "jpeg", "webp"];
    if (!allowed.includes(ext)) throw new Error("Invalid image format");

    const data = matches[2];
    const buffer = Buffer.from(data, "base64");

    // ✅ Enforce 30KB max
    if (buffer.length > 30 * 1024) throw new Error("File too large (max 30KB)");

    const uploadDir = path.join(__dirname, "../../uploads/profiles");
    await fs.mkdir(uploadDir, { recursive: true });

    const fileName = `chatUser_${Date.now()}.${ext}`;
    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, buffer);

    console.log("📸 Saved base64 image:", fileName);
    return `${process.env.BACKEND_URL || "http://localhost:8080"
      }/uploads/profiles/${fileName}`;
  } catch (err) {
    console.error("⚠️ Error saving Base64 image:", err.message);
    return "";
  }
};

// =============================================================
// 🟢 SIGNUP — Emits real-time event to Admin Dashboard
// =============================================================
const chatSignupController = async (req, res) => {
  console.log("🟢 Signup request received...");
  const timeout = setTimeout(() => {
    console.warn("⏰ Signup handler took too long — responding with timeout");
    if (!res.headersSent)
      res
        .status(500)
        .json({ success: false, message: "Server timeout. Try again." });
  }, 10000);

  try {
    const { name, chatName, email, password, profilePic } = req.body;
    const finalName = chatName || name;
    console.log("📩 Signup body:", { name: finalName, email });

    if (!finalName || !email || !password) {
      clearTimeout(timeout);
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const existingUser = await ChatUser.findOne({ email });
    if (existingUser) {
      clearTimeout(timeout);
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let savedProfilePic = "";

    // 1️⃣ Base64 upload
    if (
      profilePic &&
      typeof profilePic === "string" &&
      profilePic.startsWith("data:image/")
    ) {
      savedProfilePic = await saveBase64Image(profilePic);
    }

    // 2️⃣ Multer upload
    if (req.file && req.file.path) {
      try {
        const stats = await fs.stat(req.file.path);
        if (stats.size > 30 * 1024) {
          await fs.unlink(req.file.path);
          clearTimeout(timeout);
          return res.status(400).json({
            success: false,
            message: "File too large. Must be under 30KB.",
          });
        }

        const fileName = path.basename(req.file.path);
        savedProfilePic = `${process.env.BACKEND_URL || "http://localhost:8080"
          }/uploads/profiles/${fileName}`;
        console.log("🖼️ Multer uploaded:", savedProfilePic);
      } catch (e) {
        console.error("❌ File stat error:", e.message);
      }
    }

    const newUser = new ChatUser({
      chatName: finalName,
      email,
      password: hashedPassword,
      profilePic: savedProfilePic,
    });

    await newUser.save();
    console.log("✅ User created:", newUser.email);

    // ✅ Emit real-time event to admin panel
    if (io()) {
      io().emit("new_user_registered", newUser);
      console.log("📢 Emitted 'new_user_registered' to Admin UI");
    }

    const token = jwt.sign(
      { id: newUser._id },
      process.env.TOKEN_SECRET_KEY,
      { expiresIn: "7d" }
    );

    clearTimeout(timeout);
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: newUser,
      token,
    });
  } catch (err) {
    console.error("❌ Signup Error:", err);
    clearTimeout(timeout);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Signup failed",
        error: err.message,
      });
    }
  }
};

// =============================================================
// 🟡 SEND OTP
// =============================================================
const chatSendOtpController = async (req, res) => {
  try {
    const { email } = req.body;

    // 1️⃣ Validate input
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // 2️⃣ Check user existence
    const user = await ChatUser.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 3️⃣ Generate OTP & expiry
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    await user.save();

    // 4️⃣ Attempt to send email
    try {
      await sendOtpEmailHelper(email, otp);
      console.log(`📩 OTP ${otp} sent successfully to ${email}`);
      return res.status(200).json({
        success: true,
        message: "OTP sent successfully to your email address.",
      });
    } catch (mailErr) {
      console.error("❌ Email sending failed:", mailErr.message);
      return res.status(500).json({
        success: false,
        message:
          "Could not send OTP. Please check your email configuration or try again later.",
      });
    }
  } catch (err) {
    console.error("💥 OTP Send Error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error while sending OTP",
    });
  }
};

// =============================================================
// 🟢 VERIFY OTP
// =============================================================
const chatVerifyOtpController = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP are required" });

    const user = await ChatUser.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    if (user.otp !== otp || Date.now() > user.otpExpires) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    const token = jwt.sign(
      { id: user._id },
      process.env.TOKEN_SECRET_KEY,
      { expiresIn: "7d" }
    );

    res.json({ success: true, token, user });
  } catch (err) {
    console.error("OTP Verify Error:", err);
    res
      .status(500)
      .json({ success: false, message: "OTP verification failed" });
  }
};

// =============================================================
// 🔵 LOGIN — With Real-Time Presence Update
// =============================================================
const chatLoginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "Email and password required" });

    const user = await ChatUser.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });

    // ✅ Presence: mark online
    user.isOnline = true;
    await user.save();

    // ✅ Notify admin dashboards in real-time
    if (io()) {
      io().emit("presence_change", {
        targetType: "ChatUser",
        targetId: user._id.toString(),
        isOnline: true,
        lastActive: null,
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.TOKEN_SECRET_KEY,
      { expiresIn: "7d" }
    );

    res.json({ success: true, token, user });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ success: false, message: "Login failed" });
  }
};

// =============================================================
// 🔴 LOGOUT — With Real-Time Presence Update
// =============================================================
const chatLogoutController = async (req, res) => {
  try {
    const userId = req.user?.id || req.body?.userId || req.query?.userId;
    if (userId) {
      await ChatUser.findByIdAndUpdate(userId, {
        $set: { isOnline: false, lastActive: new Date() },
      });

      if (io()) {
        io().emit("presence_change", {
          targetType: "ChatUser",
          targetId: userId.toString(),
          isOnline: false,
          lastActive: new Date(),
        });
      }
    }
    res.json({ success: true, message: "Logged out successfully" });
  } catch (e) {
    console.error("Logout Error:", e.message);
    res.status(500).json({ success: false, message: "Logout failed" });
  }
};

// =============================================================
// 🗑️ DELETE USER — Emits live update to Admin UI
// =============================================================
const deleteChatUserController = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await ChatUser.findByIdAndDelete(id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (io()) {
      io().emit("user_deleted", { userId: id });
      console.log("🗑️ Emitted 'user_deleted' to Admin UI");
    }

    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    console.error("❌ Delete user error:", err);
    res.status(500).json({ success: false, message: "Failed to delete user" });
  }
};

// =============================================================
// ✅ EXPORTS
// =============================================================
module.exports = {
  chatSignupController,
  chatSendOtpController,
  chatVerifyOtpController,
  chatLoginController,
  chatLogoutController,
  deleteChatUserController,
};
