const mongoose = require("mongoose");

const experienceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true, // e.g., "Professional Experience"
    },
    shortPara: {
      type: String,
      required: true,
      trim: true, // e.g., "Worked as a Web Developer at Itarsia India Limited for Past 2 years..."
    },
    bullet1: {
      type: String,
      required: true,
      trim: true, // e.g., "Developing responsive custom and template-based interfaces..."
    },
    bullet2: {
      type: String,
      required: true,
      trim: true, // e.g., "Fetching and integrating APIs for dynamic, user-friendly experiences..."
    },
    footer: {
      type: String,
      trim: true, // e.g., "Positive client feedback drives us to excel..."
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

const Experience = mongoose.model("Experience", experienceSchema);

module.exports = Experience;
