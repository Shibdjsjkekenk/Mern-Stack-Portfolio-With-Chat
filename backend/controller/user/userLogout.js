const User = require("../../models/userModel");
const { io } = require("../socket/initSocket");

async function userLogout(req, res) {
  try {
    const adminId = req.user?._id || req.body?.adminId || req.query?.adminId;

    if (adminId) {
      await User.findByIdAndUpdate(adminId, {
        $set: { isOnline: false, lastActive: new Date() },
      });

      // ✅ Broadcast offline status to all connected chat users
      const ioInstance = io();
      if (ioInstance) {
        ioInstance.emit("admin_status", {
          adminId: adminId.toString(),
          isOnline: false,
        });
        console.log("📡 Admin marked offline via socket broadcast:", adminId);
      }
    }

    // ✅ Properly clear cookie for both HTTP & HTTPS (Render-ready)
    return res
      .status(200)
      .clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // ✅ ensures HTTPS compatibility
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      })
      .json({ message: "Logged out successfully.", success: true });
  } catch (err) {
    console.error("❌ Logout error:", err);
    res.status(500).json({
      message: err.message || "Logout failed",
      error: true,
      success: false,
    });
  }
}

module.exports = userLogout;
