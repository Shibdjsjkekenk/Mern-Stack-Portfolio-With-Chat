import React, { useState, useEffect } from "react";
import { AiOutlineProduct } from "react-icons/ai";
import { LuUpload } from "react-icons/lu";
import { FaEdit, FaEye, FaTrash, FaTimes } from "react-icons/fa";
import ExpUploadProject from "@/components/ExpUploadProject";
import { useProjects } from "@/customHooks/useProjects";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ExperienceContent from "@/components/ExperienceContent";

const ITEMS_PER_PAGE = 4;
const FALLBACK_IMAGE = "/fallback-project.png";

const ExperienceProject = () => {
  const [openUploadProject, setOpenUploadProject] = useState(false);
  const [selectedProjectLocal, setSelectedProjectLocal] = useState(null);
  const [viewCardOpen, setViewCardOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const { projects, loading, fetchProjects, updateStatus, deleteProject, selectProject } =
    useProjects();

  useEffect(() => {
    fetchProjects();
  }, []);

  const totalPages = Math.ceil(projects.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentData = projects.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const handleEdit = (project) => {
    setSelectedProjectLocal(project);
    selectProject(project);
    setOpenUploadProject(true);
  };

  const handleView = (project) => {
    setSelectedProjectLocal(project);
    setViewCardOpen(true);
  };

  const handleDelete = (proj) => {
    deleteProject(proj);
  };

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) setCurrentPage(page);
  };

  const getImageSrc = (img) => img || FALLBACK_IMAGE;

  return (
    <>
      <ToastContainer />

      <div className="bg-white py-2 px-4 flex justify-between items-center shadow-sm">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <AiOutlineProduct /> Experience & Projects
        </h2>
        <button
          className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-all py-1 px-3 rounded-full flex items-center gap-2"
          onClick={() => {
            setSelectedProjectLocal(null);
            setOpenUploadProject(true);
          }}
        >
          <LuUpload /> Upload Project
        </button>
      </div>

      {openUploadProject && (
        <ExpUploadProject
          mode={selectedProjectLocal ? "edit" : "create"}
          initialData={selectedProjectLocal}
          onClose={() => setOpenUploadProject(false)}
          onSuccess={(newProject) => {
            fetchProjects();
            setOpenUploadProject(false);
            setCurrentPage(1);
            if (newProject) setSelectedProjectLocal(newProject);
          }}
        />
      )}

      {viewCardOpen && selectedProjectLocal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <div className="relative w-full max-w-lg rounded-2xl p-6 shadow-2xl bg-white/95">
            <button
              onClick={() => setViewCardOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl"
            >
              <FaTimes />
            </button>
            <img
              src={getImageSrc(selectedProjectLocal.projectImage)}
              alt={selectedProjectLocal.projectTitle}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h3 className="text-2xl font-semibold text-center mb-2">
              {selectedProjectLocal.projectTitle}
            </h3>
            <div className="flex justify-center mb-2">
              <span className="font-medium text-gray-600">Status:</span>
              <span
                className={`ml-2 px-3 py-1 text-sm rounded-full ${selectedProjectLocal.status === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                  }`}
              >
                {selectedProjectLocal.status}
              </span>
            </div>
            <p className="text-gray-700 text-center mb-4">
              {selectedProjectLocal.description || "No description available."}
            </p>
            {selectedProjectLocal.projectLink && (
              <div className="text-center">
                <a
                  href={selectedProjectLocal.projectLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition"
                >
                  Visit Project
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="p-4 overflow-x-auto">
        {loading ? (
          <p>Loading projects...</p>
        ) : (
          <>
            <table className="w-full rounded-lg userTable overflow-hidden">
              <thead className="bg-gray-100 text-gray-700">
                <tr className="text-white" style={{ backgroundColor: "#6A38C2" }}>
                  <th className="p-2">Sr No</th>
                  <th className="p-2">Project Title</th>
                  <th className="p-2">Link</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentData.length > 0 ? (
                  currentData.map((proj, index) => (
                    <tr
                      key={proj._id}
                      className="text-center hover:bg-gray-50 transition border-b"
                    >
                      <td className="p-2">{startIdx + index + 1}</td>
                      <td className="p-2 font-medium text-gray-800">{proj.projectTitle}</td>
                      <td className="p-2">
                        {proj.projectLink ? (
                          <a
                            href={proj.projectLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                          >
                            Visit
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="p-2">
                        <select
                          value={proj.status}
                          onChange={(e) => updateStatus(proj._id, e.target.value)}
                          className={`px-2 py-1 rounded-lg text-sm border outline-none ${proj.status === "active"
                              ? "bg-green-100 text-green-700 border-green-200"
                              : "bg-red-100 text-red-700 border-red-200"
                            }`}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            className="text-blue-600 hover:text-blue-800 text-lg"
                            onClick={() => handleEdit(proj)}
                            title="Edit Project"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="text-green-600 hover:text-green-800 text-lg"
                            onClick={() => handleView(proj)}
                            title="View Project"
                          >
                            <FaEye />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-800 text-lg"
                            onClick={() => handleDelete(proj)}
                            title="Delete Project"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="p-4 text-center" colSpan="5">
                      No projects found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Prev
                </button>
                {[...Array(totalPages)].map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePageChange(idx + 1)}
                    className={`px-3 py-1 border rounded ${currentPage === idx + 1 ? "bg-blue-600 text-white" : "bg-white"
                      }`}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <ExperienceContent />

    </>
  );
};

export default ExperienceProject;
