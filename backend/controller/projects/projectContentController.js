const Experience = require("../../models/projectContent");

// ✅ Create Experience
const createExperience = async (req, res) => {
  try {
    const { title, shortPara, bullet1, bullet2, footer, status } = req.body;

    if (!title || !shortPara || !bullet1 || !bullet2) {
      return res.status(400).json({ success: false, message: "All required fields must be filled." });
    }

    const newExperience = new Experience({
      title,
      shortPara,
      bullet1,
      bullet2,
      footer,
      status: status || "active",
    });

    const savedExperience = await newExperience.save();
    res.status(201).json({ success: true, message: "Experience created successfully.", data: savedExperience });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create experience.", error: error.message });
  }
};

// ✅ Get All Experiences
const getExperiences = async (req, res) => {
  try {
    const experiences = await Experience.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: experiences });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch experiences.", error: error.message });
  }
};

// ✅ Get Single Experience by ID
const getExperienceById = async (req, res) => {
  try {
    const { id } = req.params;
    const experience = await Experience.findById(id);

    if (!experience) {
      return res.status(404).json({ success: false, message: "Experience not found." });
    }

    res.status(200).json({ success: true, data: experience });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch experience.", error: error.message });
  }
};

// ✅ Update Experience
const updateExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedExperience = await Experience.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedExperience) {
      return res.status(404).json({ success: false, message: "Experience not found." });
    }

    res.status(200).json({ success: true, message: "Experience updated successfully.", data: updatedExperience });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update experience.", error: error.message });
  }
};

// ✅ Delete Experience
const deleteExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedExperience = await Experience.findByIdAndDelete(id);

    if (!deletedExperience) {
      return res.status(404).json({ success: false, message: "Experience not found." });
    }

    res.status(200).json({ success: true, message: "Experience deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete experience.", error: error.message });
  }
};

module.exports = {
  createExperience,
  getExperiences,
  getExperienceById,
  updateExperience,
  deleteExperience,
};
