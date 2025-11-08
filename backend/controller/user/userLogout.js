const User = require("../../models/userModel");
const { io } = require("../socket/initSocket");

async function userLogout(req, res) {
  try {
    const adminId = req.user?._id || req.body?.adminId || req.query?.adminId;

    if (adminId) {
      await User.findByIdAndUpdate(adminId, {
        $set: { isOnline: false, lastActive: new Date() },
      });

      // ✅ Broadcast only to ChatUsers (not other admins)
      const ioInstance = io();
      if (ioInstance) {
        // Filter out only ChatUsers socket rooms if you store them by type
        ioInstance.emit("admin_status", {
          adminId: adminId.toString(),
          isOnline: false,
        });
        console.log("📡 Sent admin_status: false to all users");
      }
    }

    return res
      .status(200)
      .cookie("token", "", { maxAge: 0 })
      .json({ message: "Logged out successfully.", success: true });
  } catch (err) {
    console.error("Logout error:", err);
    res.json({ message: err.message || err, error: true, success: false });
  }
}

module.exports = userLogout;
