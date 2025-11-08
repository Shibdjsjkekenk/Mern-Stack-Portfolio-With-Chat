// src/hooks/useRelevantContents.js
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import SummaryApi, { getAuthHeaders } from "@/common";
import { toast } from "react-toastify";
import {
  setRelevantContents,
  addRelevantContent,
  updateRelevantContent,
  removeRelevantContent,
  setLoading,
  setError,
  setSelectedRelevantContent,
} from "@/store/relevantContentSlice";

export const useRelevantContents = () => {
  const dispatch = useDispatch();
  const { relevantContents, loading } = useSelector(
    (state) => state.relevantContent
  );

  // ✅ Fetch all relevant contents
  const fetchRelevantContents = async () => {
    try {
      dispatch(setLoading(true));
      const res = await axios.get(SummaryApi.getAllRelevantContent.url, {
        withCredentials: true,
        headers: getAuthHeaders(),
      });
      if (res.data.success) {
        dispatch(setRelevantContents(res.data.data));
      } else {
        toast.error("Failed to fetch relevant contents");
      }
    } catch (err) {
      console.error("Fetch Relevant Contents Error:", err);
      dispatch(setError("Error fetching relevant contents"));
      toast.error("Error fetching relevant contents");
    } finally {
      dispatch(setLoading(false));
    }
  };

  // ✅ Update relevant content data
  const updateRelevantContentData = async (id, data) => {
    try {
      const res = await axios.put(SummaryApi.updateRelevantContent(id).url, data, {
        withCredentials: true,
        headers: getAuthHeaders(),
      });
      if (res.data.success) {
        dispatch(updateRelevantContent(res.data.data));
        toast.success("Relevant content updated");
      } else {
        toast.error("Failed to update relevant content");
      }
    } catch (err) {
      console.error("Update Relevant Content Error:", err);
      toast.error("Error updating relevant content");
    }
  };

  // ✅ Update only status
  const updateRelevantContentStatus = async (id, status) => {
    await updateRelevantContentData(id, { status });
  };

  // ✅ Delete relevant content
  const deleteRelevantContentById = async (id) => {
    if (!window.confirm("Delete this relevant content?")) return;
    dispatch(removeRelevantContent(id));
    try {
      await axios.delete(SummaryApi.deleteRelevantContent(id).url, {
        withCredentials: true,
        headers: getAuthHeaders(),
      });
      toast.success("Relevant content deleted");
    } catch (err) {
      console.error("Delete Relevant Content Error:", err);
      toast.error("Failed to delete relevant content");
      fetchRelevantContents();
    }
  };

  // ✅ Select relevant content
  const selectRelevantContent = (content) =>
    dispatch(setSelectedRelevantContent(content));

  useEffect(() => {
    fetchRelevantContents();
  }, []);

  return {
    relevantContents,
    loading,
    fetchRelevantContents,
    updateRelevantContentData,
    updateRelevantContentStatus,
    deleteRelevantContentById,
    selectRelevantContent,
  };
};
