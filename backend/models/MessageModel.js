const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    // 🧾 Sender Type: ChatUser / users / Admin
    senderType: {
      type: String,
      enum: ["ChatUser", "users", "Admin"], // ✅ future-proof
      required: true,
    },

    // 🧾 Sender Reference
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "senderType", // dynamically refers to senderType model
    },

    // 🧾 Receiver Type: ChatUser / users / Admin
    receiverType: {
      type: String,
      enum: ["ChatUser", "users", "Admin"], // ✅ supports all roles
      required: true,
    },

    // 🧾 Receiver Reference
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "receiverType", // dynamically refers to receiverType model
    },

    // 🗨️ Message Content
    text: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (v) => v && v.trim().length > 0,
        message: "Message text cannot be empty",
      },
    },

    // 👁️ Read Status
    isDelivered: { type: Boolean, default: false },
    isRead: { type: Boolean, default: false },
    
  },
  { timestamps: true }
);

// 🚀 Indexing for faster chat queries (senderId + receiverId)
messageSchema.index({ senderId: 1, receiverId: 1, createdAt: 1 });

// ✅ Model Export
module.exports = mongoose.model("Message", messageSchema);
