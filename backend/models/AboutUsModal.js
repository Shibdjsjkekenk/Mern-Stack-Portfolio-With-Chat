const mongoose = require("mongoose");

const aboutUsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    para1: {
      type: String,
      required: true,
      trim: true,
    },
    para2: {
      type: String,
      required: true,
      trim: true,
    },
    resume: {
      type: String, // file path ya Cloudinary URL
    },
    image: {
      type: String, // file path ya Cloudinary URL
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const AboutUs = mongoose.model("AboutUs", aboutUsSchema);

module.exports = AboutUs;
