// =============================================================
// ✅ controller/socket/initSocket.js — Stable Presence + Messaging System
// =============================================================
const { Server } = require("socket.io");
const Message = require("../../models/MessageModel");
const ChatUser = require("../../models/ChatUserModel");
const User = require("../../models/userModel");

// 🧩 Track all online users (userId → { socketId, userType })
let onlineUsers = new Map();
let ioInstance = null;

// ----------------- Helpers -----------------
const resolveModel = (type) => {
  if (type === "ChatUser") return ChatUser;
  if (type === "Admin" || type === "users") return User;
  return null;
};
const getSocketId = (userId) => onlineUsers.get(userId?.toString())?.socketId || null;

const getAdminSockets = () => {
  const ids = [];
  for (const [uid, info] of onlineUsers.entries()) {
    if (info.userType === "Admin") ids.push(info.socketId);
  }
  return ids;
};
const getUserSockets = () => {
  const ids = [];
  for (const [uid, info] of onlineUsers.entries()) {
    if (info.userType === "ChatUser") ids.push(info.socketId);
  }
  return ids;
};

// ----------------- Presence Emitters -----------------
const emitPresenceToAdmins = (io, payload) => {
  const targets = getAdminSockets();
  if (targets.length) io.to(targets).emit("presence_change", payload);
};

const emitAdminStatusToUsers = (io, payload) => {
  const targets = getUserSockets();
  if (targets.length) io.to(targets).emit("admin_status", payload);
};

// ----------------- Database Presence -----------------
const markOnline = async (userId, userType) => {
  const Model = userType === "Admin" ? User : ChatUser;
  await Model.findByIdAndUpdate(userId, { $set: { isOnline: true } }, { new: true });
};

const markOffline = async (userId, userType) => {
  const Model = userType === "Admin" ? User : ChatUser;
  await Model.findByIdAndUpdate(
    userId,
    { $set: { isOnline: false, lastActive: new Date() } },
    { new: true }
  );
};

// =============================================================
// 🚀 Init Socket Server
// =============================================================
const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  ioInstance = io;
  console.log("✅ Socket.io initialized (with stable presence)");

  // 🩺 Heartbeat Monitor (ping-pong every 15s)
  setInterval(() => {
    io.emit("ping_check");
  }, 15000);

  io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);

    // =============================================================
    // 🧾 Register user (Admin or ChatUser)
    // =============================================================
    socket.on("register", async ({ userId, userType }) => {
      try {
        if (!userId || !userType) return;

        onlineUsers.set(userId.toString(), { socketId: socket.id, userType });
        await markOnline(userId, userType);
        console.log(`✅ Registered ${userType}: ${userId}`);

        if (userType === "ChatUser") {
          emitPresenceToAdmins(io, {
            targetType: "ChatUser",
            targetId: userId,
            isOnline: true,
            lastActive: null,
          });
        } else if (userType === "Admin") {
          emitAdminStatusToUsers(io, { adminId: userId, isOnline: true });

          // snapshot for admin
          try {
            const users = await ChatUser.find(
              {},
              "_id chatName email isOnline lastActive"
            ).lean();
            io.to(socket.id).emit("initial_presence_snapshot", { users });
          } catch (e) {
            console.error("⚠️ snapshot error:", e.message);
          }
        }
      } catch (e) {
        console.error("❌ register error:", e.message);
      }
    });

    // =============================================================
    // 💬 Message Handling
    // =============================================================
    socket.on("send_message", async (data) => {
      try {
        const { senderType, senderId, receiverType, receiverId, text } = data;
        if (!text?.trim()) return;

        const message = await Message.create({
          senderType,
          senderId,
          receiverType,
          receiverId,
          text,
        });

        const populatedMessage = await Message.findById(message._id)
          .populate({
            path: "senderId",
            select: "chatName name email profilePic role",
            model: resolveModel(senderType),
          })
          .populate({
            path: "receiverId",
            select: "chatName name email profilePic role",
            model: resolveModel(receiverType),
          });

        const receiverSocketId = getSocketId(receiverId);
        if (receiverSocketId)
          io.to(receiverSocketId).emit("new_message", populatedMessage);

        const senderSocketId = getSocketId(senderId);
        if (senderSocketId)
          io.to(senderSocketId).emit("message_sent", populatedMessage);
      } catch (err) {
        console.error("❌ send_message error:", err.message);
      }
    });

    // =============================================================
    // ✍️ Typing Indicator
    // =============================================================
    socket.on("typing", ({ from, to }) => {
      const receiverSocket = getSocketId(to);
      if (receiverSocket) io.to(receiverSocket).emit("user_typing", { from });
    });

    // =============================================================
    // ✅ Manual Admin Logout (Instant Offline Broadcast)
    // =============================================================
    socket.on("admin_status", async ({ adminId, isOnline }) => {
      try {
        if (typeof isOnline !== "boolean") return;

        console.log(`⚙️ Admin ${adminId} manually set isOnline = ${isOnline}`);

        emitAdminStatusToUsers(io, { adminId, isOnline });

        if (!isOnline && adminId) {
          await markOffline(adminId, "Admin");
          onlineUsers.delete(String(adminId));
        }
      } catch (err) {
        console.error("❌ admin_status handler error:", err.message);
      }
    });

    // =============================================================
    // ✅ Mark messages as read
    // =============================================================
    socket.on("mark_read", async ({ senderId, receiverId }) => {
      try {
        await Message.updateMany(
          { senderId, receiverId, isRead: false },
          { $set: { isRead: true } }
        );
        const senderSocket = getSocketId(senderId);
        if (senderSocket)
          io.to(senderSocket).emit("messages_read", { receiverId });
      } catch (err) {
        console.error("❌ mark_read error:", err.message);
      }
    });

    // =============================================================
    // 💓 Heartbeat (pong)
    // =============================================================
    socket.on("pong_alive", ({ userId, userType }) => {
      if (!userId || !userType) return;
      onlineUsers.set(userId.toString(), { socketId: socket.id, userType });
    });

    // =============================================================
    // 🔁 Reconnect User
    // =============================================================
    socket.on("reconnect_user", async ({ userId, userType }) => {
      if (!userId || !userType) return;
      onlineUsers.set(userId.toString(), { socketId: socket.id, userType });
      await markOnline(userId, userType);
      console.log(`🔄 Reconnected ${userType}: ${userId}`);
    });

    // =============================================================
    // 🔴 Disconnect (with debounce)
    // =============================================================
    socket.on("disconnect", () => {
      try {
        let disconnectedUserId = null;
        let disconnectedType = null;

        for (let [userId, info] of onlineUsers.entries()) {
          if (info.socketId === socket.id) {
            disconnectedUserId = userId;
            disconnectedType = info.userType;
            onlineUsers.delete(userId);
            break;
          }
        }

        if (!disconnectedUserId) return;

        setTimeout(async () => {
          const stillOffline = !onlineUsers.has(disconnectedUserId);
          if (!stillOffline) return;

          await markOffline(disconnectedUserId, disconnectedType);

          if (disconnectedType === "ChatUser") {
            emitPresenceToAdmins(io, {
              targetType: "ChatUser",
              targetId: disconnectedUserId,
              isOnline: false,
              lastActive: new Date(),
            });
          } else if (disconnectedType === "Admin") {
            emitAdminStatusToUsers(io, {
              adminId: disconnectedUserId,
              isOnline: false,
            });
          }

          console.log(`🔴 ${disconnectedType} ${disconnectedUserId} confirmed offline`);
        }, 3000);
      } catch (e) {
        console.error("disconnect error:", e.message);
      }
    });

    // =============================================================
    // 🕊️ Message Delivery + Read Receipts System
    // =============================================================
    socket.on("message_delivered", async ({ messageId, receiverId }) => {
      try {
        const updatedMsg = await Message.findByIdAndUpdate(
          messageId,
          { $set: { isDelivered: true } },
          { new: true }
        );
        if (updatedMsg) {
          const senderSocket = getSocketId(updatedMsg.senderId);
          if (senderSocket)
            io.to(senderSocket).emit("message_status_update", {
              messageId,
              status: "delivered",
            });
        }
      } catch (err) {
        console.error("⚠️ message_delivered error:", err.message);
      }
    });

    socket.on("message_read", async ({ messageId, receiverId }) => {
      try {
        const updatedMsg = await Message.findByIdAndUpdate(
          messageId,
          { $set: { isRead: true } },
          { new: true }
        );
        if (updatedMsg) {
          const senderSocket = getSocketId(updatedMsg.senderId);
          if (senderSocket)
            io.to(senderSocket).emit("message_status_update", {
              messageId,
              status: "read",
            });
        }
      } catch (err) {
        console.error("⚠️ message_read error:", err.message);
      }
    });

    socket.on("new_message_received", async ({ messageId, receiverId }) => {
      try {
        const updated = await Message.findByIdAndUpdate(
          messageId,
          { $set: { isDelivered: true } },
          { new: true }
        );
        if (updated) {
          const senderSocket = getSocketId(updated.senderId);
          if (senderSocket)
            io.to(senderSocket).emit("message_status_update", {
              messageId,
              status: "delivered",
            });
        }
      } catch (err) {
        console.error("⚠️ new_message_received error:", err.message);
      }
    });


    // =============================================================
    // 🧩 Handle Admin Logout (frontend triggers this explicitly)
    // =============================================================

    // =============================================================
    // 🧩 Handle Admin Logout (frontend triggers this explicitly)
    // =============================================================
    socket.on("admin_logged_out", async ({ adminId }) => {
      try {
        if (!adminId) return;
        onlineUsers.delete(String(adminId));
        await markOffline(adminId, "Admin");
        emitAdminStatusToUsers(io, { adminId, isOnline: false });
        console.log(`🚪 Admin manually logged out: ${adminId}`);
      } catch (err) {
        console.error("⚠️ admin_logged_out error:", err.message);
      }
    });

    // =============================================================
    // 🟢 Handle check_online_status — frontend requests current list
    // =============================================================
    socket.on("check_online_status", async () => {
      try {
        const allOnlineIds = Array.from(onlineUsers.keys());
        socket.emit("online_users", allOnlineIds);

        // ✅ Also send real admin online state (from DB)
        const adminIds = [];
        for (const [uid, info] of onlineUsers.entries()) {
          if (info.userType === "Admin") adminIds.push(uid);
        }

        if (adminIds.length > 0) {
          // make sure we wait properly for DB check
          for (const adminId of adminIds) {
            try {
              const admin = await User.findById(adminId)
                .select("isOnline")
                .lean();

              socket.emit("admin_status", {
                adminId,
                isOnline: !!admin?.isOnline,
              });
            } catch (err) {
              console.error("⚠️ Error checking admin status:", err.message);
            }
          }
        }

        console.log(`📡 Sent live online snapshot (${allOnlineIds.length} online)`);
      } catch (err) {
        console.error("⚠️ check_online_status error:", err.message);
      }
    });

    // =============================================================
    // 🔁 Force Admin Status Refresh — used when modal reopens
    // =============================================================
    socket.on("force_admin_status_refresh", async () => {
      try {
        const admins = await User.find({ role: "Admin" }).select("_id isOnline").lean();
        admins.forEach((admin) => {
          socket.emit("admin_status", {
            adminId: admin._id.toString(),
            isOnline: !!admin.isOnline,
          });
        });
        console.log("♻️ Forced admin status refresh sent to client");
      } catch (err) {
        console.error("⚠️ force_admin_status_refresh error:", err.message);
      }
    });

  });

  return io;
};

// =============================================================
// Exports
// =============================================================
module.exports = {
  initSocket,
  io: () => ioInstance,
};
