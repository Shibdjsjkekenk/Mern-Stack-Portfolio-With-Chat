const Banner = require("../../models/BannerModal");

// ✅ Create Banner
exports.createBanner = async (req, res) => {
  try {
    const { title, paragraph, italicTitle, image, isActive } = req.body;

    if (!title || !paragraph) {
      return res.status(400).json({ success: false, message: "Title and Paragraph are required" });
    }

    const newBanner = new Banner({
      title,
      paragraph,
      italicTitle: italicTitle || "",
      image,
      isActive: isActive !== undefined ? isActive : true,
    });

    await newBanner.save();
    res.status(201).json({
      success: true,
      message: "Banner created successfully",
      data: newBanner,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating Banner", error: error.message });
  }
};

// ✅ Get All Banners
exports.getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: banners });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching Banners", error: error.message });
  }
};

// ✅ Get Single Banner by ID
exports.getBannerById = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ success: false, message: "Banner not found" });
    res.status(200).json({ success: true, data: banner });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching Banner", error: error.message });
  }
};

// ✅ Update Banner
exports.updateBanner = async (req, res) => {
  try {
    const updatedBanner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedBanner) return res.status(404).json({ success: false, message: "Banner not found" });
    res.status(200).json({ success: true, message: "Banner updated successfully", data: updatedBanner });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating Banner", error: error.message });
  }
};

// ✅ Delete Banner
exports.deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ success: false, message: "Banner not found" });
    res.status(200).json({ success: true, message: "Banner deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// ✅ Update Banner Status
exports.updateBannerStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== "boolean") {
      return res.status(400).json({ success: false, message: "isActive must be a boolean" });
    }

    const banner = await Banner.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
    if (!banner) return res.status(404).json({ success: false, message: "Banner not found" });

    res.status(200).json({
      success: true,
      message: `Banner status updated to ${isActive ? "Active" : "Inactive"}`,
      data: banner,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating status", error: error.message });
  }
};
