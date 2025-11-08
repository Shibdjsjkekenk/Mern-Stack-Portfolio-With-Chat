const Timeline = require("../../models/TimeLine");

// ✅ Create Timeline
exports.createTimeline = async (req, res) => {
  try {
    const {
      educationTitle,
      educationPara1,
      educationPara2,
      certificationTitle,
      certificationPara1,
      certificationPara2,
      extraActivitiesTitle,
      extraActivitiesPara,
      hobbiesTitle,
      hobbiesPara,
      isActive,
    } = req.body;

    // Validation
    if (
      !educationTitle ||
      !educationPara1 ||
      !educationPara2 ||
      !certificationTitle ||
      !certificationPara1 ||
      !certificationPara2 ||
      !extraActivitiesTitle ||
      !extraActivitiesPara ||
      !hobbiesTitle ||
      !hobbiesPara
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const newTimeline = new Timeline({
      educationTitle,
      educationPara1,
      educationPara2,
      certificationTitle,
      certificationPara1,
      certificationPara2,
      extraActivitiesTitle,
      extraActivitiesPara,
      hobbiesTitle,
      hobbiesPara,
      isActive: isActive !== undefined ? isActive : true,
    });

    await newTimeline.save();
    res
      .status(201)
      .json({
        success: true,
        message: "Timeline created successfully",
        data: newTimeline,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error creating Timeline",
        error: error.message,
      });
  }
};

// ✅ Get All Timelines
exports.getAllTimelines = async (req, res) => {
  try {
    const timelines = await Timeline.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: timelines });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching Timelines",
        error: error.message,
      });
  }
};

// ✅ Get Single Timeline by ID
exports.getTimelineById = async (req, res) => {
  try {
    const timeline = await Timeline.findById(req.params.id);
    if (!timeline)
      return res
        .status(404)
        .json({ success: false, message: "Timeline not found" });
    res.status(200).json({ success: true, data: timeline });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching Timeline",
        error: error.message,
      });
  }
};

// ✅ Update Timeline
exports.updateTimeline = async (req, res) => {
  try {
    const updatedTimeline = await Timeline.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedTimeline)
      return res
        .status(404)
        .json({ success: false, message: "Timeline not found" });
    res.status(200).json({
      success: true,
      message: "Timeline updated successfully",
      data: updatedTimeline,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error updating Timeline",
        error: error.message,
      });
  }
};

// ✅ Delete Timeline
exports.deleteTimeline = async (req, res) => {
  try {
    const timeline = await Timeline.findByIdAndDelete(req.params.id);
    if (!timeline)
      return res
        .status(404)
        .json({ success: false, message: "Timeline not found" });
    res
      .status(200)
      .json({ success: true, message: "Timeline deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

// ✅ Update Timeline Status (active/inactive)
exports.updateTimelineStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res
        .status(400)
        .json({ success: false, message: "isActive must be true or false" });
    }

    const timeline = await Timeline.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );
    if (!timeline)
      return res
        .status(404)
        .json({ success: false, message: "Timeline not found" });

    res.status(200).json({
      success: true,
      message: `Timeline status updated to ${
        isActive ? "Active" : "Inactive"
      }`,
      data: timeline,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error updating status",
        error: error.message,
      });
  }
};
