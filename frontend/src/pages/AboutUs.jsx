import React, { useState } from "react";
import { FaEdit, FaTimes, FaCloudUploadAlt, FaEye } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { useAboutUs } from "@/customHooks/useAboutUs";
import fileToBase64 from "@/helpers/imageTobase64";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * EditAboutModal Component
 */
const EditAboutModal = ({
  formData,
  setFormData,
  onClose,
  onSave,
  openPDF,
  handleUploadImage,
  handleUploadResume,
  handleDeleteImage,
  handleDeleteResume,
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
      <div className="relative w-full max-w-lg rounded-2xl p-6 shadow-2xl bg-white max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl"
        >
          <FaTimes />
        </button>
        <h3 className="text-xl font-semibold mb-4 text-center">
          Edit About Us
        </h3>

        <div className="space-y-4">
          <input
            type="text"
            value={formData.title || ""}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
            placeholder="Title"
          />

          <textarea
            value={formData.para1 || ""}
            onChange={(e) =>
              setFormData({ ...formData, para1: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
            placeholder="Paragraph 1"
            rows={4}
          />

          <textarea
            value={formData.para2 || ""}
            onChange={(e) =>
              setFormData({ ...formData, para2: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
            placeholder="Paragraph 2"
            rows={4}
          />

          {/* Resume */}
          <div className="border p-3 rounded-md bg-gray-50">
            <label className="block font-medium mb-2">Resume (PDF)</label>
            {!formData.resume ? (
              <label className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-gray-800">
                <FaCloudUploadAlt />
                <span>Upload PDF</span>
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleUploadResume}
                />
              </label>
            ) : (
              <div className="flex items-center justify-between bg-white p-2 rounded border">
                <button
                  type="button"
                  onClick={() =>
                    openPDF(formData.resume, formData.resumeName)
                  }
                  className="text-blue-600 underline truncate"
                >
                  View Resume
                </button>
                <button
                  type="button"
                  onClick={handleDeleteResume}
                  className="text-red-600 px-2 py-1 border rounded hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          {/* Image */}
          <div className="border p-3 rounded-md bg-gray-50">
            <label className="block font-medium mb-2">Image</label>
            {!formData.image ? (
              <label className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-gray-800">
                <FaCloudUploadAlt />
                <span>Upload Image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUploadImage}
                />
              </label>
            ) : (
              <div className="relative w-32 h-32">
                <img
                  src={formData.image}
                  alt="about"
                  className="w-full h-full object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={handleDeleteImage}
                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1"
                >
                  <MdDelete />
                </button>
              </div>
            )}
          </div>

          {/* Status */}
          <select
            value={formData.isActive ? "active" : "inactive"}
            onChange={(e) =>
              setFormData({
                ...formData,
                isActive: e.target.value === "active",
              })
            }
            className="w-full border rounded px-3 py-2"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * DeleteConfirmationModal Component
 */
const DeleteConfirmationModal = ({ open, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
        <h3 className="text-lg font-semibold mb-4">
          Are you sure you want to delete this About Us entry?
        </h3>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * AboutUs Component
 */
const AboutUs = () => {
  const {
    aboutUsList,
    loading,
    updateAboutUsData,
    updateAboutUsStatus,
    deleteAboutUsById,
  } = useAboutUs();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [viewData, setViewData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  if (loading)
    return (
      <p className="text-center text-blue-500 font-medium">
        Loading About Us...
      </p>
    );

  if (!aboutUsList || aboutUsList.length === 0)
    return (
      <p className="text-center text-gray-500 mt-6">
        No About Us entries found.
      </p>
    );

  const handleEditClick = (about) => {
    setFormData({ ...about });
    setIsModalOpen(true);
  };

  const handleViewClick = (about) => {
    setViewData(about);
    setIsViewModalOpen(true);
  };

  const handleStatusChange = async (id, value) => {
    const result = await updateAboutUsStatus(id, value);
    if (result.success)
      toast.success(`Status updated to ${value ? "Active" : "Inactive"}`);
    else toast.error(result.message);
  };

  const handleSave = async () => {
    const result = await updateAboutUsData(formData._id, formData);
    if (result.success) toast.success(result.message);
    else toast.error(result.message);
    setIsModalOpen(false);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    const result = await deleteAboutUsById(deleteId);
    if (result.success) toast.success(result.message);
    else toast.error(result.message);
    setDeleteModalOpen(false);
    setDeleteId(null);
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setDeleteId(null);
  };

  // Helper function to open PDF using Blob
  const openPDF = (base64, fileName = "resume.pdf") => {
    if (!base64) return;
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++)
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, "_blank");
  };

  return (
    <div className="p-4">
      <ToastContainer position="top-right" autoClose={2000} />

      <h2 className="font-bold text-lg mb-4">About Us Entries</h2>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full rounded-lg userTable overflow-hidden">
          <thead className="bg-gray-100 text-gray-700">
            <tr className="text-white" style={{ backgroundColor: "#6A38C2" }}>
              <th className="p-2 border">No</th>
              <th className="p-2 border">Image</th>
              <th className="p-2 border">Title</th>
              <th className="p-2 border">Para 1</th>
              <th className="p-2 border">Resume</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {aboutUsList.map((about, index) => (
              <tr
                key={about._id}
                className="text-center hover:bg-gray-50 transition"
              >
                <td className="p-2 border">{index + 1}</td>
                <td className="p-2 border">
                  {about.image ? (
                    <img
                      src={about.image}
                      alt="about"
                      className="w-16 h-16 object-cover mx-auto rounded-md border"
                    />
                  ) : (
                    "—"
                  )}
                </td>
                <td className="p-2 border font-semibold text-indigo-700">
                  {about.title}
                </td>
                <td className="p-2 border max-w-xs truncate">{about.para1}</td>
                <td className="p-2 border">
                  {about.resume ? (
                    <button
                      onClick={() => openPDF(about.resume, about.resumeName)}
                      className="text-blue-600 underline"
                    >
                      View PDF
                    </button>
                  ) : (
                    "—"
                  )}
                </td>

                <td className="p-2 border">
                  <select
                    value={about.isActive ? "active" : "inactive"}
                    onChange={(e) =>
                      handleStatusChange(
                        about._id,
                        e.target.value === "active"
                      )
                    }
                    className={`px-2 py-1 rounded-lg text-sm border ${
                      about.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </td>
                <td className="p-2 border">
                  <div className="flex justify-center gap-2">
                    <button
                      className="text-purple-600 hover:text-purple-800"
                      onClick={() => handleViewClick(about)}
                      title="View"
                    >
                      <FaEye />
                    </button>
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => handleEditClick(about)}
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleDeleteClick(about._id)}
                      title="Delete"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <EditAboutModal
          formData={formData}
          setFormData={setFormData}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          handleUploadImage={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const base64 = await fileToBase64(file);
            setFormData((prev) => ({
              ...prev,
              image: `data:image/${file.type.split("/")[1]};base64,${base64}`,
            }));
          }}
          handleUploadResume={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const base64 = await fileToBase64(file);
            setFormData((prev) => ({
              ...prev,
              resume: base64,
              resumeName: file.name,
            }));
          }}
          handleDeleteImage={() =>
            setFormData((prev) => ({ ...prev, image: "" }))
          }
          handleDeleteResume={() =>
            setFormData((prev) => ({ ...prev, resume: "", resumeName: "" }))
          }
          openPDF={openPDF}
        />
      )}

      {/* View Modal */}
      {isViewModalOpen && viewData && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl p-6">
            <button
              onClick={() => setIsViewModalOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              <FaTimes />
            </button>

            <h3 className="text-xl font-semibold mb-6 text-center">
              View About Us
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                {viewData.image ? (
                  <img
                    src={viewData.image}
                    alt="About"
                    className="rounded-lg w-full h-64 object-cover border"
                  />
                ) : (
                  <div className="flex items-center justify-center h-64 border rounded-lg bg-gray-50 text-gray-400">
                    No Image
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-lg font-semibold mb-2">{viewData.title}</p>
                <p className="text-gray-700 mb-3">{viewData.para1}</p>
                <p className="text-gray-700 mb-4">{viewData.para2}</p>

                {viewData.resume && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => openPDF(viewData.resume, viewData.resumeName)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                      View Resume
                    </button>
                    <a
                      href={`data:application/pdf;base64,${viewData.resume}`}
                      download={viewData.resumeName || "resume.pdf"}
                      className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                    >
                      Download Resume
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={deleteModalOpen}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export default AboutUs;
