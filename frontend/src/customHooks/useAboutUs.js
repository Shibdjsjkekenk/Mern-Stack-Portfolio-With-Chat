import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import SummaryApi, { getAuthHeaders } from "@/common";
import {
  setAboutUsList,
  addAboutUs,
  updateAboutUs,
  removeAboutUs,
  setLoading,
  setError,
  setSelectedAboutUs,
} from "@/store/aboutUsSlice";

export const useAboutUs = () => {
  const dispatch = useDispatch();
  const { aboutUsList, loading } = useSelector((state) => state.aboutUs);

  const fetchAboutUs = async () => {
    try {
      dispatch(setLoading(true));
      const res = await axios.get(SummaryApi.getAllAboutUs.url, {
        withCredentials: true,
        headers: getAuthHeaders(),
      });
      if (res.data.success) {
        dispatch(setAboutUsList(res.data.data));
        return true;
      } else {
        dispatch(setError("Failed to fetch About Us entries"));
        return false;
      }
    } catch {
      dispatch(setError("Error fetching About Us entries"));
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const createAboutUs = async (data) => {
    try {
      const res = await axios.post(SummaryApi.createAboutUs.url, data, {
        withCredentials: true,
        headers: getAuthHeaders(),
      });
      if (res.data.success) {
        dispatch(addAboutUs(res.data.data));
        return { success: true, message: "About Us created successfully" };
      } else {
        return { success: false, message: "Failed to create About Us" };
      }
    } catch {
      return { success: false, message: "Error creating About Us" };
    }
  };

  const updateAboutUsData = async (id, data) => {
    try {
      const res = await axios.put(SummaryApi.updateAboutUs(id).url, data, {
        withCredentials: true,
        headers: getAuthHeaders(),
      });
      if (res.data.success) {
        dispatch(updateAboutUs(res.data.data));
        return { success: true, message: "About Us updated successfully" };
      } else {
        return { success: false, message: "Failed to update About Us" };
      }
    } catch {
      return { success: false, message: "Error updating About Us" };
    }
  };

  const updateAboutUsStatus = async (id, isActive) => {
    return updateAboutUsData(id, { isActive });
  };

  const deleteAboutUsById = async (id) => {
    if (!window.confirm("Delete this About Us entry?")) return { success: false };
    try {
      await axios.delete(SummaryApi.deleteAboutUs(id).url, {
        withCredentials: true,
        headers: getAuthHeaders(),
      });
      dispatch(removeAboutUs(id));
      return { success: true, message: "Deleted About Us entry" };
    } catch {
      await fetchAboutUs();
      return { success: false, message: "Failed to delete About Us" };
    }
  };

  const selectAboutUs = (about) => dispatch(setSelectedAboutUs(about));

  useEffect(() => {
    fetchAboutUs();
  }, []);

  return {
    aboutUsList,
    loading,
    fetchAboutUs,
    createAboutUs,
    updateAboutUsData,
    updateAboutUsStatus,
    deleteAboutUsById,
    selectAboutUs,
  };
};
