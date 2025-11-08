import React, { useState, useEffect } from "react";
import { FaEdit, FaEye, FaTimes, FaCloudUploadAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { useBanner } from "@/customHooks/useBanner";
import { toast } from "react-toastify";
import fileToBase64 from "@/helpers/imageTobase64";

const ITEMS_PER_PAGE = 4;

const BannerSection = () => {
  const {
    bannerList: originalBannerList,
    loading,
    updateBannerData,
    updateBannerStatus,
    deleteBannerById,
  } = useBanner();

  const [bannerList, setBannerList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isViewOnly, setIsViewOnly] = useState(false);

  // Sync local state with redux/store
  useEffect(() => {
    setBannerList(originalBannerList || []);
  }, [originalBannerList]);

  if (loading)
    return (
      <p className="text-center text-blue-500 font-medium">Loading Banners...</p>
    );

  if (!bannerList || bannerList.length === 0)
    return (
      <p className="text-center text-gray-500 mt-6">No Banners found.</p>
    );

  // Filter only active banners for user-facing frontend
  const activeBanners = bannerList.filter(b => b.isActive);

  const totalPages = Math.ceil(activeBanners.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentData = activeBanners.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const handleEditClick = (banner) => {
    setFormData({ ...banner });
    setIsViewOnly(false);
    setIsModalOpen(true);
  };

  const handleViewClick = (banner) => {
    setFormData({ ...banner });
    setIsViewOnly(true);
    setIsModalOpen(true);
  };

  const handleStatusChange = async (banner) => {
    const newStatus = !banner.isActive;
    try {
      await updateBannerStatus(banner._id, newStatus);

      const updatedList = bannerList.map((b) =>
        b._id === banner._id ? { ...b, isActive: newStatus } : b
      );
      setBannerList(updatedList);

      // Toast only once
      toast.success(`Status updated to ${newStatus ? "Active" : "Inactive"}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) setCurrentPage(page);
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const base64 = await fileToBase64(file);
    setFormData((prev) => ({
      ...prev,
      image: `data:image/${file.type.split("/")[1]};base64,${base64}`,
    }));
  };

  const handleDeleteImage = () =>
    setFormData((prev) => ({ ...prev, image: "" }));

  const handleSave = async () => {
    try {
      await updateBannerData(formData._id, formData);

      // Update local state immediately
      const updatedList = bannerList.map((b) =>
        b._id === formData._id ? { ...formData } : b
      );
      setBannerList(updatedList);

      toast.success("Banner updated successfully");

      setIsModalOpen(false);
    } catch {
      toast.error("Failed to update Banner");
    }
  };

  return (
    <div className="p-4">
      <h2 className="font-bold text-lg mb-4">Banner Section</h2>

      <div className="overflow-x-auto">
        <table className="w-full rounded-lg userTable overflow-hidden">
          <thead className="bg-gray-100 text-gray-700">
            <tr className="text-white" style={{ backgroundColor: "#6A38C2" }}>
              <th className="p-2 border">No</th>
              <th className="p-2 border">Image</th>
              <th className="p-2 border">Title</th>
              <th className="p-2 border">Paragraph</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {bannerList.map((banner, index) => (
              <tr
                key={banner._id}
                className="text-center hover:bg-gray-50 transition"
              >
                <td className="p-2 border">{index + 1}</td>
                <td className="p-2 border">
                  {banner.image ? (
                    <img
                      src={banner.image}
                      alt="banner"
                      className="w-16 h-16 object-cover mx-auto rounded-md border"
                    />
                  ) : (
                    "—"
                  )}
                </td>
                <td className="p-2 border font-semibold text-indigo-700">
                  {banner.title}
                </td>
                <td className="p-2 border max-w-xs truncate">{banner.paragraph}</td>
                <td className="p-2 border">
                  <select
                    value={banner.isActive ? "active" : "inactive"}
                    onChange={() => handleStatusChange(banner)}
                    className={`px-2 py-1 rounded-lg text-sm border ${
                      banner.isActive
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
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => handleEditClick(banner)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => deleteBannerById(banner._id)}
                    >
                      <MdDelete />
                    </button>
                    <button
                      className="text-green-600 hover:text-green-800"
                      onClick={() => handleViewClick(banner)}
                    >
                      <FaEye />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
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
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <div className="relative w-full max-w-lg rounded-2xl p-6 shadow-2xl bg-white max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl"
            >
              <FaTimes />
            </button>
            <h3 className="text-xl font-semibold mb-4 text-center">
              {isViewOnly ? "View Banner" : "Edit Banner"}
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
                disabled={isViewOnly}
              />
              <input
                type="text"
                value={formData.italicTitle || ""}
                onChange={(e) =>
                  setFormData({ ...formData, italicTitle: e.target.value })
                }
                className="w-full border rounded px-3 py-2 italic"
                placeholder="Italic Title"
                disabled={isViewOnly}
              />
              <textarea
                value={formData.paragraph || ""}
                onChange={(e) =>
                  setFormData({ ...formData, paragraph: e.target.value })
                }
                className="w-full border rounded px-3 py-2"
                placeholder="Paragraph"
                disabled={isViewOnly}
              />

              <div className="border p-3 rounded-md bg-gray-50">
                <label className="block font-medium mb-2">Image</label>
                {!formData.image ? (
                  !isViewOnly && (
                    <label className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-gray-800">
                      <FaCloudUploadAlt /> <span>Upload Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleUploadImage}
                      />
                    </label>
                  )
                ) : (
                  <div className="relative w-32 h-32 mx-auto">
                    <img
                      src={formData.image}
                      alt="banner"
                      className="w-full h-full object-cover rounded border"
                    />
                    {!isViewOnly && (
                      <button
                        type="button"
                        onClick={handleDeleteImage}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1"
                      >
                        <MdDelete />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <select
                value={formData.isActive ? "active" : "inactive"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    isActive: e.target.value === "active",
                  })
                }
                className="w-full border rounded px-3 py-2"
                disabled={isViewOnly}
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
                Close
              </button>
              {!isViewOnly && (
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerSection;
