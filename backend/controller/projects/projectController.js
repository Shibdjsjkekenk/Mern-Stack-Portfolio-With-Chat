const Project = require("../../models/projectModal");

// ✅ Create Project
exports.createProject = async (req, res) => {
  try {
    const { projectTitle, projectLink, projectImage, description } = req.body;

    if (!projectTitle || !projectLink || !projectImage || !description) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const newProject = new Project({
      projectTitle,
      projectLink,
      projectImage,   // ✅ single image (string)
      description,
    });

    await newProject.save();
    res.status(201).json({ success: true, message: "Project created successfully", data: newProject });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating project", error: error.message });
  }
};

// ✅ Get All Projects
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching projects", error: error.message });
  }
};

// ✅ Get Single Project
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }
    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching project", error: error.message });
  }
};

// ✅ Update Project
exports.updateProject = async (req, res) => {
  try {
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }
    res.status(200).json({ success: true, message: "Project updated successfully", data: updatedProject });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating project", error: error.message });
  }
};

// ✅ Delete Project
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.status(200).json({ message: "Project deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// ✅ Update Project Status (Active/Inactive)
exports.updateProjectStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    res.status(200).json({ success: true, message: `Project status updated to ${status}`, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating status", error: error.message });
  }
};
