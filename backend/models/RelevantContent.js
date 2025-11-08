const mongoose = require("mongoose");

const relevantContentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true, // e.g., "About Our Services"
    },
    para: {
      type: String,
      required: true,
      trim: true, // e.g., "We provide a wide range of web development solutions tailored to client needs..."
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active", // Optional field to activate/deactivate content
    },
  },
  { timestamps: true }
);

const RelevantContent = mongoose.model("RelevantContent", relevantContentSchema);

module.exports = RelevantContent;
