const mongoose = require("mongoose");

const chatUserSchema = new mongoose.Schema({
  chatName: { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String }, // Optional if OTP only login
  profilePic: { type: String, default: "" },
  otp: { type: String },
  otpExpires: { type: Date },
  isVerified: { type: Boolean, default: false },

  // ✅ Presence fields
  isOnline:   { type: Boolean, default: false },
  lastActive: { type: Date },
  
}, { timestamps: true });

module.exports = mongoose.model("ChatUser", chatUserSchema);
