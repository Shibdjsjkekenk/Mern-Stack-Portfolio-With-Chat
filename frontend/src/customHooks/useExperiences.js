import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import SummaryApi, { getAuthHeaders } from "@/common";
import { toast } from "react-toastify";
import {
  setExperiences,
  addExperience,
  updateExperience,
  removeExperience,
  setLoading,
  setError,
  setSelectedExperience,
} from "@/store/experienceSlice";

export const useExperiences = () => {
  const dispatch = useDispatch();
  const { experiences, loading } = useSelector((state) => state.experience);

  const fetchExperiences = async () => {
    try {
      dispatch(setLoading(true));
      const res = await axios.get(SummaryApi.getAllExperience.url, {
        withCredentials: true,
        headers: getAuthHeaders(),
      });
      if (res.data.success) {
        dispatch(setExperiences(res.data.data));
      } else {
        toast.error("Failed to fetch experiences");
      }
    } catch {
      dispatch(setError("Error fetching experiences"));
      toast.error("Error fetching experiences");
    } finally {
      dispatch(setLoading(false));
    }
  };

  const updateExperienceData = async (id, data) => {
    try {
      const res = await axios.put(SummaryApi.updateExperience(id).url, data, {
        withCredentials: true,
        headers: getAuthHeaders(),
      });
      if (res.data.success) {
        dispatch(updateExperience(res.data.data));
        toast.success("Experience updated");
      } else toast.error("Failed to update experience");
    } catch {
      toast.error("Error updating experience");
    }
  };

  const updateExperienceStatus = async (id, status) => {
    await updateExperienceData(id, { status });
  };

  const deleteExperience = async (id) => {
    if (!window.confirm("Delete this experience?")) return;
    dispatch(removeExperience(id));
    try {
      await axios.delete(SummaryApi.deleteExperience(id).url, {
        withCredentials: true,
        headers: getAuthHeaders(),
      });
      toast.success("Deleted");
    } catch {
      toast.error("Delete failed");
      fetchExperiences();
    }
  };

  const selectExperience = (exp) => dispatch(setSelectedExperience(exp));

  useEffect(() => {
    fetchExperiences();
  }, []);

  return {
    experiences,
    loading,
    fetchExperiences,
    updateExperienceData,
    updateExperienceStatus,
    deleteExperience,
    selectExperience,
  };
};
