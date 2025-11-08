const mongoose = require("mongoose");

const relevantSchema = new mongoose.Schema(
  {
    relevantTitle: {
      type: String,
      required: true,
      trim: true,
    },
    relevantLink: {
      type: String,
      required: true,
      trim: true,
    },
    relevantImage: {
      type: String, // ✅ single image (base64 string or image URL)
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const Relevant = mongoose.model("Relevant", relevantSchema);

module.exports = Relevant;
