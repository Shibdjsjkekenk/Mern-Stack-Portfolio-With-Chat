const Relevant = require("../../models/RelevantModal");

// ✅ Create Relevant
exports.createRelevant = async (req, res) => {
  try {
    const { relevantTitle, relevantLink, relevantImage, description } = req.body;
    if (!relevantTitle || !relevantLink || !relevantImage || !description) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    const newRelevant = new Relevant({ relevantTitle, relevantLink, relevantImage, description });
    await newRelevant.save();
    res.status(201).json({ success: true, message: "Relevant created successfully", data: newRelevant });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating relevant", error: error.message });
  }
};

// ✅ Get All Relevants
exports.getAllRelevants = async (req, res) => {
  try {
    const relevants = await Relevant.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: relevants });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching relevants", error: error.message });
  }
};

// ✅ Get Single Relevant
exports.getRelevantById = async (req, res) => {
  try {
    const relevant = await Relevant.findById(req.params.id);
    if (!relevant) return res.status(404).json({ success: false, message: "Relevant not found" });
    res.status(200).json({ success: true, data: relevant });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching relevant", error: error.message });
  }
};

// ✅ Update Relevant
exports.updateRelevant = async (req, res) => {
  try {
    const updatedRelevant = await Relevant.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedRelevant) return res.status(404).json({ success: false, message: "Relevant not found" });
    res.status(200).json({ success: true, message: "Relevant updated successfully", data: updatedRelevant });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating relevant", error: error.message });
  }
};

// ✅ Delete Relevant
exports.deleteRelevant = async (req, res) => {
  try {
    const relevant = await Relevant.findByIdAndDelete(req.params.id);
    if (!relevant) return res.status(404).json({ message: "Relevant not found" });
    res.status(200).json({ message: "Relevant deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// ✅ Update Relevant Status
exports.updateRelevantStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }
    const relevant = await Relevant.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!relevant) return res.status(404).json({ success: false, message: "Relevant not found" });
    res.status(200).json({ success: true, message: `Relevant status updated to ${status}`, data: relevant });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating status", error: error.message });
  }
};
