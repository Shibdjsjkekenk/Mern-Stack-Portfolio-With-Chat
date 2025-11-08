// src/customHooks/useProjects.js
import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import SummaryApi, { getAuthHeaders } from "@/common";
import { toast } from "react-toastify";
import {
  setProjects,
  removeProject,
  setLoading,
  setError,
  setSelectedProject,
  updateProjectStatus,
} from "@/store/projectSlice";

export const useProjects = () => {
  const dispatch = useDispatch();
  const { projects, loading } = useSelector((state) => state.project);

  // Fetch all projects
  const fetchProjects = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const res = await axios.get(SummaryApi.getAllProjects.url, {
        withCredentials: true,
        headers: getAuthHeaders(),
      });

      if (res.data.success && Array.isArray(res.data.data)) {
        const normalizedData = res.data.data.map((proj) => {
          let imageSrc = proj.projectImage || "";

          if (imageSrc && !imageSrc.startsWith("data:") && !imageSrc.startsWith("http")) {
            imageSrc = `${SummaryApi.baseURL}/${imageSrc}`;
          }
          if (imageSrc.startsWith("/9j/")) imageSrc = `data:image/jpeg;base64,${imageSrc}`;
          else if (imageSrc.startsWith("UklG")) imageSrc = `data:image/webp;base64,${imageSrc}`;
          else if (imageSrc.startsWith("iVBOR")) imageSrc = `data:image/png;base64,${imageSrc}`;

          return { ...proj, projectImage: imageSrc };
        });

        dispatch(setProjects(normalizedData));
      } else {
        toast.error(res.data.message || "Failed to fetch projects");
        dispatch(setProjects([]));
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
      dispatch(setError("Error fetching projects"));
      toast.error("Error fetching projects");
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  // Update project status instantly
  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(
        SummaryApi.updateProject(id).url,
        { status: newStatus },
        { withCredentials: true, headers: getAuthHeaders() }
      );

      dispatch(updateProjectStatus({ id, status: newStatus }));
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update status");
    }
  };

  // Delete project with JSX confirmation toast
  const deleteProject = (proj) => {
    const toastId = toast.warning(
      <div className="text-center">
        <p className="font-semibold mb-2">
          Are you sure you want to delete <br /> <b>{proj.projectTitle}</b>?
        </p>
        <div className="flex justify-center gap-3 mt-2">
          <button
            onClick={() => toast.dismiss(toastId)}
            className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
          >
            No
          </button>
          <button
            onClick={async () => {
              try {
                await axios.delete(SummaryApi.deleteProject(proj._id).url, {
                  withCredentials: true,
                  headers: getAuthHeaders(),
                });
                dispatch(removeProject(proj._id));
                toast.dismiss(toastId);
                toast.success("Project deleted successfully");
              } catch (err) {
                console.error("Error deleting project:", err);
                toast.dismiss(toastId);
                toast.error("Failed to delete project");
              }
            }}
            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
          >
            Yes
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

  const selectProject = (project) => dispatch(setSelectedProject(project));

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    loading,
    fetchProjects,
    updateStatus,
    deleteProject,
    selectProject,
  };
};
