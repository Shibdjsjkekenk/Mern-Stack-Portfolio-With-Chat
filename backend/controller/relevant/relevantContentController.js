const RelevantContent = require("../../models/RelevantContent");

// ✅ Create Relevant Content
const createRelevantContent = async (req, res) => {
  try {
    const { title, para, status } = req.body;

    if (!title || !para) {
      return res
        .status(400)
        .json({ success: false, message: "Title and paragraph are required." });
    }

    const newContent = new RelevantContent({
      title,
      para,
      status: status || "active",
    });

    const savedContent = await newContent.save();
    res
      .status(201)
      .json({ success: true, message: "Content created successfully.", data: savedContent });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to create content.", error: error.message });
  }
};

// ✅ Get All Relevant Content
const getRelevantContents = async (req, res) => {
  try {
    const contents = await RelevantContent.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: contents });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch content.", error: error.message });
  }
};

// ✅ Get Single Content by ID
const getRelevantContentById = async (req, res) => {
  try {
    const { id } = req.params;
    const content = await RelevantContent.findById(id);

    if (!content) {
      return res
        .status(404)
        .json({ success: false, message: "Content not found." });
    }

    res.status(200).json({ success: true, data: content });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch content.", error: error.message });
  }
};

// ✅ Update Relevant Content
const updateRelevantContent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedContent = await RelevantContent.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedContent) {
      return res
        .status(404)
        .json({ success: false, message: "Content not found." });
    }

    res.status(200).json({
      success: true,
      message: "Content updated successfully.",
      data: updatedContent,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to update content.", error: error.message });
  }
};

// ✅ Delete Relevant Content
const deleteRelevantContent = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedContent = await RelevantContent.findByIdAndDelete(id);

    if (!deletedContent) {
      return res
        .status(404)
        .json({ success: false, message: "Content not found." });
    }

    res
      .status(200)
      .json({ success: true, message: "Content deleted successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to delete content.", error: error.message });
  }
};

module.exports = {
  createRelevantContent,
  getRelevantContents,
  getRelevantContentById,
  updateRelevantContent,
  deleteRelevantContent,
};
