const Message = require("../../models/MessageModel");
const ChatUser = require("../../models/ChatUserModel");
const User = require("../../models/userModel");
const mongoose = require("mongoose");

// 🧠 Safe model resolver for dynamic populate
const resolveModel = (type) => {
  if (type === "ChatUser") return ChatUser;
  if (type === "users" || type === "Admin") return User;
  return null;
};

// =============================================================
// 💬 HYBRID MESSAGE HANDLER — DB + SOCKET BOTH
// =============================================================
exports.sendMessage = async (req, res) => {
  try {
    const { senderType, senderId, receiverType, receiverId, text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message text is required",
      });
    }

    // ✅ STEP 1: Save Message to DB
    const newMessage = await Message.create({
      senderType,
      senderId,
      receiverType,
      receiverId,
      text,
    });

    // ✅ STEP 2: Populate sender & receiver (safe model resolution)
    const populatedMessage = await Message.findById(newMessage._id)
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

    // ✅ STEP 3: Emit via socket if available
    if (req.io) {
      req.io.emit("new_message", populatedMessage);
      console.log("📩 Message emitted via socket");
    }

    // ✅ STEP 4: Response
    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: populatedMessage,
    });
  } catch (err) {
    console.error("❌ Error in sendMessage:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while sending message",
      error: err.message,
    });
  }
};

// =============================================================
// 📜 GET ALL MESSAGES BETWEEN ChatUser AND ADMIN
// =============================================================
exports.getMessages = async (req, res) => {
  try {
    const { userId, adminId } = req.params;

    if (!userId || !adminId) {
      return res.status(400).json({
        success: false,
        message: "User ID and Admin ID are required",
      });
    }

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: adminId },
        { senderId: adminId, receiverId: userId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate({
        path: "senderId",
        select: "chatName name email profilePic role",
        model: resolveModel("ChatUser"),
      })
      .populate({
        path: "receiverId",
        select: "chatName name email profilePic role",
        model: resolveModel("users"),
      });

    return res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (err) {
    console.error("❌ Error in getMessages:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching messages",
      error: err.message,
    });
  }
};

// =============================================================
// 👥 GET ALL USERS WHO HAVE CHATTED WITH ADMIN
// =============================================================
exports.getChatUsers = async (req, res) => {
  try {
    const userIds = await Message.distinct("senderId", {
      receiverType: { $in: ["Admin", "users"] },
    });

    const users = await ChatUser.find({ _id: { $in: userIds } }).select(
      "_id chatName email profilePic createdAt"
    );

    const adminSentIds = await Message.distinct("receiverId", {
      senderType: { $in: ["Admin", "users"] },
    });

    const additionalUsers = await ChatUser.find({
      _id: { $in: adminSentIds },
    }).select("_id chatName email profilePic createdAt");

    const allUsers = [
      ...users,
      ...additionalUsers.filter(
        (u) => !users.some((user) => user._id.toString() === u._id.toString())
      ),
    ];

    const formattedUsers = allUsers.map((u) => ({
      _id: u._id,
      chatName: u.chatName || u.email?.split("@")[0] || "User",
      email: u.email,
      profilePic: u.profilePic,
      createdAt: u.createdAt,
    }));

    return res.status(200).json({
      success: true,
      count: formattedUsers.length,
      data: formattedUsers,
    });
  } catch (err) {
    console.error("❌ Error in getChatUsers:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching chat users",
      error: err.message,
    });
  }
};

// =============================================================
// 📨 GET USER CHAT SUMMARY — last message + unread count
// =============================================================
exports.getChatSummary = async (req, res) => {
  try {
    const { adminId } = req.params;

    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: "Admin ID is required",
      });
    }

    const summary = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: new mongoose.Types.ObjectId(adminId) },
            { receiverId: new mongoose.Types.ObjectId(adminId) },
          ],
        },
      },
      // ✅ Sort by latest messages first
      { $sort: { createdAt: -1 } },

      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderType", "ChatUser"] },
              "$senderId",
              "$receiverId",
            ],
          },
          lastMessage: { $first: "$text" },
          lastTime: { $first: "$createdAt" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$receiverId", new mongoose.Types.ObjectId(adminId)] },
                    { $eq: ["$isRead", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: "chatusers",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: "$user._id",
          chatName: { $ifNull: ["$user.chatName", "$user.email"] },
          email: "$user.email",
          profilePic: "$user.profilePic",
          lastMessage: 1,
          unreadCount: 1,
          lastTime: {
            $dateToString: {
              format: "%Y-%m-%dT%H:%M:%S",
              date: "$lastTime",
              timezone: "Asia/Kolkata",
            },
          },
        },
      },
      // ✅ Always sort latest message on top
      { $sort: { lastTime: -1 } },
    ]);

    return res.status(200).json({
      success: true,
      count: summary.length,
      data: summary,
    });
  } catch (err) {
    console.error("❌ Error in getChatSummary:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching chat summary",
      error: err.message,
    });
  }
};


// =============================================================
// ✅ MARK MESSAGES AS READ (when admin opens chat)
// =============================================================
exports.markMessagesRead = async (req, res) => {
  try {
    const { userId, adminId } = req.params;

    const result = await Message.updateMany(
      {
        senderId: new mongoose.Types.ObjectId(userId),
        receiverId: new mongoose.Types.ObjectId(adminId),
        isRead: false,
      },
      { $set: { isRead: true } }
    );

    return res.status(200).json({
      success: true,
      message: "Messages marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    console.error("❌ Error marking messages as read:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to mark messages as read",
      error: err.message,
    });
  }
};
