// src/components/RelevantProject.jsx
import React, { useState } from "react";
import { AiOutlineProject } from "react-icons/ai";
import { LuUpload } from "react-icons/lu";
import { FaEdit, FaEye, FaTrash, FaTimes } from "react-icons/fa";
import { useRelevantProjects } from "@/customHooks/useRelevantProjects";
import RelevantUploadProject from "@/components/RelevantUploadProject";
import RelevantContentTable from "@/components/RelevantContentsTable";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ITEMS_PER_PAGE = 4;

const RelevantProject = () => {
  const [openUpload, setOpenUpload] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const {
    relevantProjects,
    loading,
    fetchRelevantProjects,
    updateRelevantProjectStatus,
    deleteRelevantProjectById,
    selectRelevantProject,
  } = useRelevantProjects();

  const totalPages = Math.ceil(relevantProjects.length / ITEMS_PER_PAGE) || 1;
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentData = relevantProjects.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const handleEdit = (proj) => {
    setSelectedProject(proj);
    setOpenUpload(true);
    selectRelevantProject(proj);
  };

  const handleView = (proj) => {
    setSelectedProject(proj);
    setViewOpen(true);
  };

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) setCurrentPage(page);
  };

  // ✅ Confirmation toast for delete
  const confirmDeleteToast = (proj) => {
    const toastId = toast.warning(
      <div className="text-center">
        <p className="font-semibold mb-2">
          Are you sure you want to delete <br /> <b>{proj.relevantTitle}</b>?
        </p>
        <div className="flex justify-center gap-3 mt-2">
          <button
            onClick={() => {
              toast.dismiss(toastId);
              handleDelete(proj._id);
            }}
            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
          >
            Yes
          </button>
          <button
            onClick={() => toast.dismiss(toastId)}
            className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
          >
            No
          </button>
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
        draggable: false,
      }
    );
  };

  const handleDelete = async (id) => {
    const res = await deleteRelevantProjectById(id);
    if (res.success) {
      toast.success("Project deleted successfully!", {
      });
    } else {
      toast.error("Failed to delete project!", {
        position: "bottom-right",
        autoClose: 2000,
      });
    }
  };

  return (
    <>
      <ToastContainer />

      <div className="bg-white py-2 px-4 flex justify-between items-center">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <AiOutlineProject /> Relevant Projects
        </h2>
        <button
          className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-all py-1 px-3 rounded-full flex items-center gap-2"
          onClick={() => {
            setSelectedProject(null);
            setOpenUpload(true);
          }}
        >
          <LuUpload /> Upload Project
        </button>
      </div>

      {openUpload && (
        <RelevantUploadProject
          mode={selectedProject ? "edit" : "create"}
          initialData={selectedProject}
          onClose={() => setOpenUpload(false)}
          onSuccess={() => {
            fetchRelevantProjects();
            setCurrentPage(1);
          }}
        />
      )}

      {viewOpen && selectedProject && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <div className="relative w-full max-w-lg rounded-2xl p-6 shadow-2xl bg-white/90 backdrop-blur-md">
            <button
              onClick={() => setViewOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl"
            >
              <FaTimes />
            </button>
            {selectedProject.relevantImage && (
              <img
                src={selectedProject.relevantImage}
                alt={selectedProject.relevantTitle}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}
            <h3 className="text-2xl font-semibold text-center mb-3">
              {selectedProject.relevantTitle}
            </h3>

            <div className="flex justify-center mb-3">
              <span className="font-medium text-gray-600">Status:</span>
              <span
                className={`ml-2 px-3 py-1 text-sm rounded-full font-semibold ${
                  selectedProject.status === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {selectedProject.status.charAt(0).toUpperCase() +
                  selectedProject.status.slice(1)}
              </span>
            </div>

            <p className="text-gray-700 text-center mb-4">
              {selectedProject.description || "No description available."}
            </p>
            {selectedProject.relevantLink && (
              <div className="text-center">
                <a
                  href={selectedProject.relevantLink}
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
          <p>Loading relevant projects...</p>
        ) : (
          <>
            <table className="w-full rounded-lg userTable overflow-hidden">
              <thead className="bg-gray-100 text-gray-700">
                <tr className="text-white" style={{ backgroundColor: "#6A38C2" }}>
                  <th className="p-2 border">Sr No</th>
                  <th className="p-2 border">Title</th>
                  <th className="p-2 border">Link</th>
                  <th className="p-2 border">Status</th>
                  <th className="p-2 border">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentData.length > 0 ? (
                  currentData.map((proj, idx) => (
                    <tr
                      key={proj._id}
                      className="text-center hover:bg-gray-50 transition"
                    >
                      <td className="p-2 border">{startIdx + idx + 1}</td>
                      <td className="p-2 border">{proj.relevantTitle}</td>
                      <td className="p-2 border">
                        <a
                          href={proj.relevantLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          Visit
                        </a>
                      </td>
                      <td className="p-2 border">
                        <select
                          value={proj.status || "active"}
                          onChange={async (e) => {
                            const res = await updateRelevantProjectStatus(
                              proj._id,
                              e.target.value
                            );
                            toast[res.success ? "success" : "error"](res.message, {
                            });
                          }}
                          className={`px-2 py-1 rounded-lg text-sm border ${
                            proj.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </td>
                      <td className="!p-4 border flex justify-center gap-3">
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => handleEdit(proj)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="text-green-600 hover:text-green-800"
                          onClick={() => handleView(proj)}
                        >
                          <FaEye />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800"
                          onClick={() => confirmDeleteToast(proj)}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="p-4 border text-center" colSpan="5">
                      No relevant projects found
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
                    className={`px-3 py-1 border rounded ${
                      currentPage === idx + 1 ? "bg-blue-600 text-white" : ""
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

      <RelevantContentTable />
    </>
  );
};

export default RelevantProject;
