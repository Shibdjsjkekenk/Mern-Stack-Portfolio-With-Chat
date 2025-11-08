const mongoose = require("mongoose");

const timelineSchema = new mongoose.Schema(
  {
    educationTitle: {
      type: String,
      required: true,
      trim: true,
    },
    educationPara1: {
      type: String,
      required: true,
      trim: true,
    },
    educationPara2: {
      type: String,
      required: true,
      trim: true,
    },
    certificationTitle: {
      type: String,
      required: true,
      trim: true,
    },
    certificationPara1: {
      type: String,
      required: true,
      trim: true,
    },
    certificationPara2: {
      type: String,
      required: true,
      trim: true,
    },
    extraActivitiesTitle: {
      type: String,
      required: true,
      trim: true,
    },
    extraActivitiesPara: {
      type: String,
      required: true,
      trim: true,
    },
    hobbiesTitle: {
      type: String,
      required: true,
      trim: true,
    },
    hobbiesPara: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Timeline = mongoose.model("Timeline", timelineSchema);

module.exports = Timeline;
