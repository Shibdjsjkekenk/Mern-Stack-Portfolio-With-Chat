const mongoose = require('mongoose');

const loginSubSchema = new mongoose.Schema({
  deviceName: String,
  ipAddress: String,
  city: String,
  state: String,
  country: String,
  latitude: Number,   // Add latitude
  longitude: Number,  // Add longitude
  loggedInAt: { type: Date, default: Date.now },
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
  },

  password: {
    type: String,
    required: true,
  },

  profilePic: {
    type: String,
    default: "",
  },

  role: {
    type: String,
    default: "GENERAL", // or "ADMIN"
  },

  // ✅ Presence Tracking Fields
  isOnline: {
    type: Boolean,
    default: false, // true when logged in or connected via socket
  },

  lastActive: {
    type: Date, // updated on logout or socket disconnect
  },

  // ✅ Login history
  loginCount: {
    type: Number,
    default: 0,
  },
  

  logins: [loginSubSchema],

}, {
  timestamps: true, // createdAt & updatedAt automatically managed
});

// Optional: helper virtual for last active display
userSchema.virtual("lastActiveDisplay").get(function () {
  if (!this.lastActive) return "Never Active";
  const diffMs = Date.now() - this.lastActive.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
});

const userModel = mongoose.model("users", userSchema);
module.exports = userModel;
