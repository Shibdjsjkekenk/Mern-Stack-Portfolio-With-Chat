// src/hooks/useRelevantProjects.js
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import SummaryApi, { getAuthHeaders } from "@/common";
import {
  setRelevantProjects,
  removeRelevantProject,
  setRelevantProjectLoading,
  setRelevantProjectError,
  setSelectedRelevantProject,
} from "@/store/relevantProjectSlice";

export const useRelevantProjects = () => {
  const dispatch = useDispatch();
  const { relevantProjects, loading } = useSelector(
    (state) => state.relevantProject
  );

  // ✅ Fetch all relevant projects
  const fetchRelevantProjects = async () => {
    try {
      dispatch(setRelevantProjectLoading(true));
      const res = await axios.get(SummaryApi.getAllRelevantProjects.url, {
        withCredentials: true,
        headers: getAuthHeaders(),
      });
      if (res.data.success) {
        dispatch(setRelevantProjects(res.data.data));
      }
    } catch {
      dispatch(setRelevantProjectError("Error fetching relevant projects"));
    } finally {
      dispatch(setRelevantProjectLoading(false));
    }
  };

  // ✅ Update project status
  const updateRelevantProjectStatus = async (id, newStatus) => {
    try {
      await axios.patch(
        SummaryApi.updateRelevantProjectStatus(id).url,
        { status: newStatus },
        { withCredentials: true, headers: getAuthHeaders() }
      );
      fetchRelevantProjects();
      return { success: true, message: `Status updated to ${newStatus}` };
    } catch {
      return { success: false, message: "Failed to update status" };
    }
  };

  // ✅ Delete relevant project (no toast here)
  const deleteRelevantProjectById = async (id) => {
    try {
      await axios.delete(SummaryApi.deleteRelevantProject(id).url, {
        withCredentials: true,
        headers: getAuthHeaders(),
      });
      dispatch(removeRelevantProject(id));
      return { success: true };
    } catch {
      fetchRelevantProjects();
      return { success: false };
    }
  };

  // ✅ Select relevant project
  const selectRelevantProject = (project) =>
    dispatch(setSelectedRelevantProject(project));

  useEffect(() => {
    fetchRelevantProjects();
  }, []);

  return {
    relevantProjects,
    loading,
    fetchRelevantProjects,
    updateRelevantProjectStatus,
    deleteRelevantProjectById,
    selectRelevantProject,
  };
};
