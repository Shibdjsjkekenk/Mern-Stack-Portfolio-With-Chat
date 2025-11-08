const mongoose = require("mongoose");

const contactUsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false, // new contacts by default unread
    },
    replied: {
      type: Boolean,
      default: false, // new contacts by default not replied
    },
  },
  { timestamps: true }
);

const ContactUs = mongoose.model("ContactUs", contactUsSchema);

module.exports = ContactUs;
