import React, { useState, useEffect } from "react";
import { CgClose } from "react-icons/cg";
import { FaCloudUploadAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { toast } from "react-toastify";
import axios from "axios";
import imageToBase64 from "../helpers/imageToBase64";
import SummaryApi, { getAuthHeaders } from "../common";

const ExpUploadProject = ({
  onClose,
  mode = "create", // "create" | "edit" | "view"
  initialData = {},
  onSuccess,
}) => {
  const [data, setData] = useState({
    projectTitle: "",
    projectLink: "",
    projectImage: "",
    description: "",
    status: "active",
  });

  // ✅ Prefill when editing or viewing
  useEffect(() => {
    if (initialData && (mode === "edit" || mode === "view")) {
      console.log("Editing project:", initialData);
      setData(initialData);
    }
  }, [initialData, mode]);

  const handleOnChange = (e) => {
    if (mode === "view") return;
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ Fix: handle both new uploads and existing URLs
  const handleUploadProjectImage = async (e) => {
    if (mode === "view") return;
    const file = e.target.files[0];
    if (file) {
      const base64Image = await imageToBase64(file);
      setData((prev) => ({
        ...prev,
        projectImage: base64Image,
        preview: URL.createObjectURL(file), // for instant preview
      }));
    }
  };

  const handleDeleteImage = () => {
    if (mode === "view") return;
    setData((prev) => ({
      ...prev,
      projectImage: "",
      preview: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (mode === "edit") {
        const { url, method } = SummaryApi.updateProject(data._id);
        response = await axios({
          method,
          url,
          headers: getAuthHeaders(),
          data,
          withCredentials: true,
        });
      } else {
        response = await axios({
          method: SummaryApi.createProject.method,
          url: SummaryApi.createProject.url,
          headers: { "Content-Type": "application/json" },
          data,
          withCredentials: true,
        });
      }

      const apiRes = response.data;
      if (apiRes.success) {
        toast.success(
          apiRes.message ||
            `${mode === "edit" ? "Project updated" : "Project created"} successfully`
        );
        onSuccess?.();
        onClose();
      } else {
        toast.error(apiRes.message || "Operation failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  // ✅ Determine which image to show
  const displayedImage =
    data.preview ||
    (data.projectImage?.startsWith("data:image")
      ? data.projectImage
      : data.projectImage
      ? data.projectImage
      : "");

  return (
    <div className="fixed w-full h-full bg-black/40 top-0 left-0 flex justify-center items-center z-50">
      <div className="bg-white p-4 rounded w-full max-w-2xl h-full max-h-[80%] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center pb-3">
          <h2 className="font-bold text-lg">
            {mode === "view"
              ? "View Project"
              : mode === "edit"
              ? "Edit Project"
              : "Upload Project Detail"}
          </h2>
          <div
            className="w-fit ml-auto text-2xl hover:text-red-600 cursor-pointer"
            onClick={onClose}
          >
            <CgClose />
          </div>
        </div>

        {/* Form */}
        <form
          className="grid p-4 gap-2 overflow-y-scroll h-full pb-5"
          onSubmit={handleSubmit}
        >
          <label htmlFor="projectTitle">Project Title :</label>
          <input
            type="text"
            id="projectTitle"
            name="projectTitle"
            value={data.projectTitle}
            onChange={handleOnChange}
            className="p-2 bg-slate-100 border rounded"
            required
            disabled={mode === "view"}
          />

          <label htmlFor="projectLink" className="mt-3">
            Project Link :
          </label>
          <input
            type="text"
            id="projectLink"
            name="projectLink"
            value={data.projectLink}
            onChange={handleOnChange}
            className="p-2 bg-slate-100 border rounded"
            required
            disabled={mode === "view"}
          />

          <label className="mt-3">Project Image :</label>
          <label htmlFor="uploadImageInput">
            <div className="p-2 bg-slate-100 border rounded h-32 w-full flex justify-center items-center cursor-pointer relative">
              {!displayedImage ? (
                mode !== "view" && (
                  <div className="text-slate-500 flex flex-col gap-2 items-center">
                    <span className="text-4xl">
                      <FaCloudUploadAlt />
                    </span>
                    <p className="text-sm">Upload Project Image</p>
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
                    src={displayedImage}
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

          <label htmlFor="status" className="mt-3">
            Status :
          </label>
          <select
            id="status"
            name="status"
            value={data.status}
            onChange={handleOnChange}
            className="p-2 bg-slate-100 border rounded"
            disabled={mode === "view"}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <label htmlFor="description" className="mt-3">
            Description :
          </label>
          <textarea
            id="description"
            name="description"
            value={data.description}
            onChange={handleOnChange}
            className="h-28 bg-slate-100 border resize-none p-1"
            required
            disabled={mode === "view"}
          />

          {mode !== "view" && (
            <button className="px-3 py-2 bg-red-600 text-white mb-10 hover:bg-red-700 rounded">
              {mode === "edit" ? "Update Project" : "Upload Project"}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default ExpUploadProject;
