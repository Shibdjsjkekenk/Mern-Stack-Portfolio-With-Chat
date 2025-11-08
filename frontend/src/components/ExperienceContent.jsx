import React, { useState } from "react";
import { FaEdit, FaTimes } from "react-icons/fa";
import { useExperiences } from "@/customHooks/useExperiences";

const ITEMS_PER_PAGE = 4;

const ExperienceContent = () => {
  const { experiences, loading, updateExperienceStatus, updateExperienceData } = useExperiences();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  if (loading) {
    return <p className="text-center text-blue-500 font-medium">Loading experiences...</p>;
  }

  if (!experiences || experiences.length === 0) {
    return <p className="text-center text-gray-500 mt-6">No experiences found.</p>;
  }

  // Pagination
  const totalPages = Math.ceil(experiences.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentData = experiences.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const handleEditClick = (exp) => {
    setFormData({ ...exp });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    updateExperienceData(formData._id, formData); // call hook method to update data
    setIsModalOpen(false);
  };

  const handleStatusChange = (id, value) => {
    updateExperienceStatus(id, value); // call hook method to update status
  };

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="p-4">
      <h2 className="font-bold text-lg mb-4">Experiences</h2>
      <div className="overflow-x-auto">
        <table className="w-full rounded-lg userTable overflow-hidden">
          <thead className="bg-gray-100 text-gray-700">
            <tr className="text-white" style={{ backgroundColor: "#6A38C2" }}>
              <th className="p-2 border">No</th>
              <th className="p-2 border white-space">Project Title</th>
              <th className="p-2 border">Description</th>
              <th className="p-2 border">Bullet Points</th>
              <th className="p-2 border">Footer</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((exp, index) => (
              <tr key={exp._id} className="text-center hover:bg-gray-50 transition">
                <td className="p-2 border">{startIdx + index + 1}</td>
                <td className="p-2 border font-semibold text-indigo-700 ">{exp.title}</td>
                <td className="p-2 border max-w-xs truncate">{exp.shortPara}</td>
                <td className="p-2 border text-left">
                  <ul className="list-disc list-inside">
                    <li>{exp.bullet1}</li>
                    <li>{exp.bullet2}</li>
                  </ul>
                </td>
                <td className="p-2 border italic text-gray-500">{exp.footer || "—"}</td>
                <td className="p-2 border">
                  <select
                    value={exp.status || "inactive"}
                    onChange={(e) => handleStatusChange(exp._id, e.target.value)}
                    className={`px-2 py-1 rounded-lg text-sm border ${exp.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                      }`}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </td>
                <td className="p-2 border">
                  <button
                    className="text-blue-600 hover:text-blue-800"
                    onClick={() => handleEditClick(exp)}
                  >
                    <FaEdit />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
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
                className={`px-3 py-1 border rounded ${currentPage === idx + 1 ? "bg-blue-600 text-white" : ""
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
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <div className="relative w-full max-w-lg rounded-2xl p-6 shadow-2xl bg-white">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl"
            >
              <FaTimes />
            </button>
            <h3 className="text-xl font-semibold mb-4 text-center">Edit Experience</h3>
            <div className="space-y-4">
              <input
                type="text"
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="Project Title"
              />
              <textarea
                value={formData.shortPara || ""}
                onChange={(e) => setFormData({ ...formData, shortPara: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="Description"
              />
              <input
                type="text"
                value={formData.bullet1 || ""}
                onChange={(e) => setFormData({ ...formData, bullet1: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="Bullet Point 1"
              />
              <input
                type="text"
                value={formData.bullet2 || ""}
                onChange={(e) => setFormData({ ...formData, bullet2: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="Bullet Point 2"
              />
              <input
                type="text"
                value={formData.footer || ""}
                onChange={(e) => setFormData({ ...formData, footer: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="Footer"
              />
              <select
                value={formData.status || "inactive"}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExperienceContent;
