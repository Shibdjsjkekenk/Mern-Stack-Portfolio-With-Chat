// src/components/RelevantUploadProject.jsx
import React, { useState, useEffect } from "react";
import { CgClose } from "react-icons/cg";
import { FaCloudUploadAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { toast } from "react-toastify";
import axios from "axios";
import imageToBase64 from "../helpers/imageToBase64";
import SummaryApi, { getAuthHeaders } from "../common";

const RelevantUploadProject = ({
  onClose,
  mode = "create", // "create" | "edit" | "view"
  initialData = {},
  onSuccess,
}) => {
  const [data, setData] = useState({
    relevantTitle: "",
    relevantLink: "",
    relevantImage: "",
    description: "",
    status: "active",
  });

  // Prefill when editing or viewing
  useEffect(() => {
    if (initialData && (mode === "edit" || mode === "view")) {
      setData(initialData);
    }
  }, [initialData, mode]);

  const handleOnChange = (e) => {
    if (mode === "view") return;
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUploadProjectImage = async (e) => {
    if (mode === "view") return;
    const file = e.target.files[0];
    if (file) {
      const base64Image = await imageToBase64(file);
      setData((prev) => ({ ...prev, relevantImage: base64Image }));
    }
  };

  const handleDeleteImage = () => {
    if (mode === "view") return;
    setData((prev) => ({ ...prev, relevantImage: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!data.relevantTitle || !data.relevantLink || !data.relevantImage || !data.description) {
      toast.error("All fields are required");
      return;
    }

    try {
      let response;
      if (mode === "edit") {
        const { url, method } = SummaryApi.updateRelevantProject(data._id);
        response = await axios({
          method,
          url,
          headers: getAuthHeaders(),
          data,
          withCredentials: true,
        });
      } else {
        response = await axios({
          method: SummaryApi.createRelevantProject.method,
          url: SummaryApi.createRelevantProject.url,
          headers: { "Content-Type": "application/json" },
          data,
          withCredentials: true,
        });
      }

      const apiRes = response.data;
      if (apiRes.success) {
        toast.success(apiRes.message || `${mode === "edit" ? "Project updated" : "Project created"} successfully`);
        onSuccess?.();
        onClose();
      } else {
        toast.error(apiRes.message || "Operation failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="fixed w-full h-full bg-black/40 top-0 left-0 flex justify-center items-center z-50">
      <div className="bg-white p-4 rounded w-full max-w-2xl h-full max-h-[80%] overflow-auto relative">
        {/* Header */}
        <div className="flex justify-between items-center pb-3">
          <h2 className="font-bold text-lg">
            {mode === "view"
              ? "View Project"
              : mode === "edit"
              ? "Edit Project"
              : "Upload Project Detail"}
          </h2>
          <CgClose
            className="text-2xl cursor-pointer hover:text-red-600"
            onClick={onClose}
          />
        </div>

        {/* Form */}
        <form className="grid p-4 gap-2" onSubmit={handleSubmit}>
          <label>Project Title:</label>
          <input
            type="text"
            name="relevantTitle"
            value={data.relevantTitle}
            onChange={handleOnChange}
            className="p-2 bg-slate-100 border rounded"
            required
            disabled={mode === "view"}
          />

          <label>Project Link:</label>
          <input
            type="text"
            name="relevantLink"
            value={data.relevantLink}
            onChange={handleOnChange}
            className="p-2 bg-slate-100 border rounded"
            required
            disabled={mode === "view"}
          />

          <label>Project Image:</label>
          <label htmlFor="uploadImageInput">
            <div className="p-2 bg-slate-100 border rounded h-32 w-full flex justify-center items-center cursor-pointer">
              {!data.relevantImage ? (
                mode !== "view" && (
                  <div className="text-slate-500 flex flex-col gap-2 items-center">
                    <FaCloudUploadAlt className="text-4xl" />
                    <span className="text-sm">Upload Project Image</span>
                    <input
                      type="file"
                      id="uploadImageInput"
                      className="hidden"
                      onChange={handleUploadProjectImage}
                      accept="image/*"
                    />
                  </div>
                )
              ) : (
                <div className="relative">
                  <img
                    src={data.relevantImage}
                    alt="project"
                    className="h-24 w-24 object-cover rounded border"
                  />
                  {mode !== "view" && (
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
          </label>

          <label>Status:</label>
          <select
            name="status"
            value={data.status}
            onChange={handleOnChange}
            className="p-2 bg-slate-100 border rounded"
            disabled={mode === "view"}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <label>Description:</label>
          <textarea
            name="description"
            value={data.description}
            onChange={handleOnChange}
            className="h-28 bg-slate-100 border resize-none p-1"
            required
            disabled={mode === "view"}
          />

          {mode !== "view" && (
            <button className="px-3 py-2 bg-red-600 text-white hover:bg-red-700 mt-2">
              {mode === "edit" ? "Update Project" : "Upload Project"}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default RelevantUploadProject;
