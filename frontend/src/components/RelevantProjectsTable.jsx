import React, { useState } from "react";
import { FaEdit, FaEye, FaTrash, FaTimes } from "react-icons/fa";
import { LuUpload } from "react-icons/lu";
import { AiOutlineProject } from "react-icons/ai";
import RelevantUploadProject from "./RelevantUploadProject";
import { useRelevantProjects } from "@/customHooks/useRelevantProjects";

const ITEMS_PER_PAGE = 4;

const RelevantProjectsTable = () => {
  const { relevantProjects, loading, fetchRelevantProjects, updateRelevantProjectStatus, deleteRelevantProjectById } =
    useRelevantProjects();
  const [openModal, setOpenModal] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [editData, setEditData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(relevantProjects.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentData = relevantProjects.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const handlePageChange = (page) => page > 0 && page <= totalPages && setCurrentPage(page);

  return (
    <>
      <div className="bg-white p-4 flex justify-between items-center">
        <h2 className="font-bold text-lg flex gap-2">
          <AiOutlineProject /> Relevant Projects
        </h2>
        <button
          onClick={() => {
            setEditData(null);
            setOpenModal(true);
          }}
          className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-3 py-1 rounded-full flex items-center gap-2"
        >
          <LuUpload /> Upload
        </button>
      </div>

      {openModal && (
        <RelevantUploadProject
          mode={editData ? "edit" : "create"}
          initialData={editData}
          onClose={() => setOpenModal(false)}
          onSuccess={() => fetchRelevantProjects()}
        />
      )}

      {viewData && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-white p-6 rounded-lg relative max-w-md w-full">
            <button onClick={() => setViewData(null)} className="absolute top-3 right-3 text-gray-600">
              <FaTimes />
            </button>
            {viewData.image && (
              <img src={viewData.image} alt={viewData.title} className="w-full h-40 object-cover rounded mb-3" />
            )}
            <h3 className="text-xl font-bold mb-2">{viewData.title}</h3>
            <p className="text-gray-600 mb-3">{viewData.description}</p>
            {viewData.link && (
              <a href={viewData.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                Visit
              </a>
            )}
          </div>
        </div>
      )}

      <div className="p-4 overflow-x-auto">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="w-full border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">#</th>
                <th className="p-2 border">Title</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((proj, i) => (
                <tr key={proj._id} className="hover:bg-gray-50 text-center">
                  <td className="p-2 border">{startIdx + i + 1}</td>
                  <td className="p-2 border">{proj.title}</td>
                  <td className="p-2 border">
                    <select
                      value={proj.status}
                      onChange={(e) => updateRelevantProjectStatus(proj._id, e.target.value)}
                      className="border p-1 rounded"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </td>
                  <td className="p-2 border flex justify-center gap-3">
                    <button
                      onClick={() => {
                        setEditData(proj);
                        setOpenModal(true);
                      }}
                      className="text-blue-600"
                    >
                      <FaEdit />
                    </button>
                    <button onClick={() => setViewData(proj)} className="text-green-600">
                      <FaEye />
                    </button>
                    <button onClick={() => deleteRelevantProjectById(proj._id)} className="text-red-600">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {currentData.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-gray-500">
                    No relevant projects
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
              Prev
            </button>
            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx}
                onClick={() => handlePageChange(idx + 1)}
                className={currentPage === idx + 1 ? "font-bold" : ""}
              >
                {idx + 1}
              </button>
            ))}
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
              Next
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default RelevantProjectsTable;
