const AboutUs = require("../../models/AboutUsModal");

// ✅ Create About Us
exports.createAboutUs = async (req, res) => {
  try {
    const { title, para1, para2, isActive } = req.body;

    if (!title || !para1 || !para2) {
      return res.status(400).json({ success: false, message: "Title, Para1, and Para2 are required" });
    }

    const newAbout = new AboutUs({
      title,
      para1,
      para2,
      resume: req.body.resume || "", // yadi Cloudinary ya multer se path aaye
      image: req.body.image || "",
      isActive: isActive !== undefined ? isActive : true,
    });

    await newAbout.save();
    res.status(201).json({ success: true, message: "About Us created successfully", data: newAbout });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating About Us", error: error.message });
  }
};

// ✅ Get All About Us Entries
exports.getAllAboutUs = async (req, res) => {
  try {
    const abouts = await AboutUs.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: abouts });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching About Us", error: error.message });
  }
};

// ✅ Get Single About Us by ID
exports.getAboutUsById = async (req, res) => {
  try {
    const about = await AboutUs.findById(req.params.id);
    if (!about) return res.status(404).json({ success: false, message: "About Us not found" });
    res.status(200).json({ success: true, data: about });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching About Us", error: error.message });
  }
};

// ✅ Update About Us
exports.updateAboutUs = async (req, res) => {
  try {
    const updatedAbout = await AboutUs.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedAbout) return res.status(404).json({ success: false, message: "About Us not found" });
    res.status(200).json({ success: true, message: "About Us updated successfully", data: updatedAbout });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating About Us", error: error.message });
  }
};

// ✅ Delete About Us
exports.deleteAboutUs = async (req, res) => {
  try {
    const about = await AboutUs.findByIdAndDelete(req.params.id);
    if (!about) return res.status(404).json({ success: false, message: "About Us not found" });
    res.status(200).json({ success: true, message: "About Us deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// ✅ Update About Us Status (active/inactive)
exports.updateAboutUsStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({ success: false, message: "isActive must be true or false" });
    }

    const about = await AboutUs.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
    if (!about) return res.status(404).json({ success: false, message: "About Us not found" });

    res.status(200).json({
      success: true,
      message: `About Us status updated to ${isActive ? "Active" : "Inactive"}`,
      data: about,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating status", error: error.message });
  }
};
