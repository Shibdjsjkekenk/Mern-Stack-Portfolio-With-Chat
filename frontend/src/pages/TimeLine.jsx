import React, { useState } from "react";
import { FaEdit, FaTimes, FaEye } from "react-icons/fa";
import { useTimeline } from "@/customHooks/useTimeLine";
import { toast } from "react-toastify";

const Timeline = () => {
  const {
    timelineList,
    loading,
    updateTimelineData,
    updateTimelineStatus,
    deleteTimelineById,
  } = useTimeline();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  if (loading)
    return (
      <p className="text-center text-blue-500 font-medium">
        Loading Timeline...
      </p>
    );

  if (!timelineList || timelineList.length === 0)
    return (
      <p className="text-center text-gray-500 mt-6">
        No Timeline entries found.
      </p>
    );

  // Handle Edit
  const handleEditClick = (timeline) => {
    setFormData({ ...timeline });
    setIsEditModalOpen(true);
  };

  // Handle View
  const handleViewClick = (timeline) => {
    setFormData({ ...timeline });
    setIsViewModalOpen(true);
  };

  // Handle Status Change
  const handleStatusChange = async (id, value) => {
    const res = await updateTimelineStatus(id, value);
    if (res.success) toast.success(res.message);
    else toast.error(res.message);
  };

  // Handle Save (Edit Modal)
  const handleSave = async () => {
    const res = await updateTimelineData(formData._id, formData);
    if (res.success) {
      toast.success(res.message);
      setIsEditModalOpen(false);
    } else {
      toast.error(res.message);
    }
  };

  // Handle Delete
  const handleDelete = async (id) => {
    const res = await deleteTimelineById(id);
    if (res.success) toast.success(res.message);
    else if (res.message !== "Cancelled") toast.error(res.message);
  };

  return (
    <div className="p-4">
      <h2 className="font-bold text-lg mb-4">Timeline Entries</h2>

      <div className="overflow-x-auto">
        <table className="w-full rounded-lg userTable overflow-hidden">
          <thead className="bg-gray-100 text-gray-700">
            <tr className="text-white" style={{ backgroundColor: "#6A38C2" }}>
              <th className="p-2 border">No</th>
              <th className="p-2 border">Education Title</th>
              <th className="p-2 border">Certification Title</th>
              <th className="p-2 border">Extra Activities Title</th>
              <th className="p-2 border">Hobbies Title</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {timelineList.map((timeline, index) => (
              <tr
                key={timeline._id}
                className="text-center hover:bg-gray-50 transition"
              >
                <td className="p-2 border">{index + 1}</td>
                <td className="p-2 border font-semibold text-indigo-700">
                  {timeline.educationTitle}
                </td>
                <td className="p-2 border">{timeline.certificationTitle}</td>
                <td className="p-2 border">{timeline.extraActivitiesTitle}</td>
                <td className="p-2 border">{timeline.hobbiesTitle}</td>
                <td className="p-2 border">
                  <select
                    value={timeline.isActive ? "active" : "inactive"}
                    onChange={(e) =>
                      handleStatusChange(
                        timeline._id,
                        e.target.value === "active"
                      )
                    }
                    className={`px-2 py-1 rounded-lg text-sm border ${
                      timeline.isActive
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
                      className="text-green-600 hover:text-green-800"
                      onClick={() => handleViewClick(timeline)}
                    >
                      <FaEye />
                    </button>
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => handleEditClick(timeline)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleDelete(timeline._id)}
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

      {/* ---------- Edit Modal ---------- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <div className="relative w-full max-w-3xl rounded-2xl p-6 shadow-2xl bg-white max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl"
            >
              <FaTimes />
            </button>
            <h3 className="text-2xl font-bold mb-4 text-center text-indigo-700">
              Edit Timeline
            </h3>

            <div className="space-y-4">
              {/* Education */}
              <div className="p-4 border rounded-xl shadow-sm bg-indigo-50">
                <h4 className="font-semibold text-lg mb-2">Education</h4>
                <input
                  type="text"
                  value={formData.educationTitle || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      educationTitle: e.target.value,
                    })
                  }
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 mb-2"
                  placeholder="Education Title"
                />
                <textarea
                  value={formData.educationPara1 || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      educationPara1: e.target.value,
                    })
                  }
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 mb-2"
                  placeholder="Education Para 1"
                />
                <textarea
                  value={formData.educationPara2 || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      educationPara2: e.target.value,
                    })
                  }
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="Education Para 2"
                />
              </div>

              {/* Certification */}
              <div className="p-4 border rounded-xl shadow-sm bg-green-50">
                <h4 className="font-semibold text-lg mb-2">Certification</h4>
                <input
                  type="text"
                  value={formData.certificationTitle || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      certificationTitle: e.target.value,
                    })
                  }
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 mb-2"
                  placeholder="Certification Title"
                />
                <textarea
                  value={formData.certificationPara1 || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      certificationPara1: e.target.value,
                    })
                  }
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 mb-2"
                  placeholder="Certification Para 1"
                />
                <textarea
                  value={formData.certificationPara2 || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      certificationPara2: e.target.value,
                    })
                  }
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="Certification Para 2"
                />
              </div>

              {/* Extra Activities */}
              <div className="p-4 border rounded-xl shadow-sm bg-yellow-50">
                <h4 className="font-semibold text-lg mb-2">Extra Activities</h4>
                <input
                  type="text"
                  value={formData.extraActivitiesTitle || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      extraActivitiesTitle: e.target.value,
                    })
                  }
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 mb-2"
                  placeholder="Extra Activities Title"
                />
                <textarea
                  value={formData.extraActivitiesPara || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      extraActivitiesPara: e.target.value,
                    })
                  }
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="Extra Activities Para"
                />
              </div>

              {/* Hobbies */}
              <div className="p-4 border rounded-xl shadow-sm bg-pink-50">
                <h4 className="font-semibold text-lg mb-2">Hobbies</h4>
                <input
                  type="text"
                  value={formData.hobbiesTitle || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hobbiesTitle: e.target.value,
                    })
                  }
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 mb-2"
                  placeholder="Hobbies Title"
                />
                <textarea
                  value={formData.hobbiesPara || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hobbiesPara: e.target.value,
                    })
                  }
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  placeholder="Hobbies Para"
                />
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
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-6 sticky bottom-0 bg-white p-3 shadow-inner">
              <button
                onClick={() => setIsEditModalOpen(false)}
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

      {/* ---------- View Modal ---------- */}
      {isViewModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <div className="relative w-full max-w-3xl rounded-2xl p-6 shadow-2xl bg-white max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsViewModalOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl"
            >
              <FaTimes />
            </button>
            <h3 className="text-2xl font-bold mb-6 text-center text-indigo-700">
              Timeline Details
            </h3>

            <div className="space-y-4">
              <div className="p-4 border rounded shadow-sm bg-gray-50">
                <h4 className="font-semibold text-lg">Education</h4>
                <p>
                  <strong>Title:</strong> {formData.educationTitle}
                </p>
                <p>
                  <strong>Para 1:</strong> {formData.educationPara1}
                </p>
                <p>
                  <strong>Para 2:</strong> {formData.educationPara2}
                </p>
              </div>

              <div className="p-4 border rounded shadow-sm bg-gray-50">
                <h4 className="font-semibold text-lg">Certification</h4>
                <p>
                  <strong>Title:</strong> {formData.certificationTitle}
                </p>
                <p>
                  <strong>Para 1:</strong> {formData.certificationPara1}
                </p>
                <p>
                  <strong>Para 2:</strong> {formData.certificationPara2}
                </p>
              </div>

              <div className="p-4 border rounded shadow-sm bg-gray-50">
                <h4 className="font-semibold text-lg">Extra Activities</h4>
                <p>
                  <strong>Title:</strong> {formData.extraActivitiesTitle}
                </p>
                <p>
                  <strong>Para:</strong> {formData.extraActivitiesPara}
                </p>
              </div>

              <div className="p-4 border rounded shadow-sm bg-gray-50">
                <h4 className="font-semibold text-lg">Hobbies</h4>
                <p>
                  <strong>Title:</strong> {formData.hobbiesTitle}
                </p>
                <p>
                  <strong>Para:</strong> {formData.hobbiesPara}
                </p>
              </div>

              <div className="p-4 border rounded shadow-sm bg-gray-50">
                <h4 className="font-semibold text-lg">Status</h4>
                <p>{formData.isActive ? "Active" : "Inactive"}</p>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timeline;
