// src/customHooks/useBanner.js
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import SummaryApi, { getAuthHeaders } from "@/common";
import {
  setBannerList,
  addBanner,
  updateBanner,
  removeBanner,
  setBannerLoading,
  setBannerError,
  setSelectedBanner,
} from "@/store/bannerSlice";

export const useBanner = () => {
  const dispatch = useDispatch();
  const { bannerList, loading } = useSelector((state) => state.banner);

  // 🔹 Fetch all banners
  const fetchBanners = async () => {
    try {
      dispatch(setBannerLoading(true));
      const res = await axios.get(SummaryApi.getAllBanners.url, {
        withCredentials: true,
        headers: getAuthHeaders(),
      });
      if (res.data.success) {
        dispatch(setBannerList(res.data.data));
      } else {
        dispatch(setBannerError("Failed to fetch Banners"));
      }
    } catch {
      dispatch(setBannerError("Error fetching Banners"));
    } finally {
      dispatch(setBannerLoading(false));
    }
  };

  // 🔹 Create new banner
  const createBanner = async (data) => {
    try {
      const res = await axios.post(SummaryApi.createBanner.url, data, {
        withCredentials: true,
        headers: getAuthHeaders(),
      });
      if (res.data.success) {
        dispatch(addBanner(res.data.data));
        return true; // component can show toast
      } else return false;
    } catch {
      return false;
    }
  };

  // 🔹 Update banner
  const updateBannerData = async (id, data) => {
    try {
      const res = await axios.put(SummaryApi.updateBanner(id).url, data, {
        withCredentials: true,
        headers: getAuthHeaders(),
      });
      if (res.data.success) {
        dispatch(updateBanner(res.data.data));
        return true; // component handles toast
      } else return false;
    } catch {
      return false;
    }
  };

  // 🔹 Update status
  const updateBannerStatus = async (id, isActive) => {
    return await updateBannerData(id, { isActive });
  };

  // 🔹 Delete banner
  const deleteBannerById = async (id) => {
    if (!window.confirm("Delete this Banner?")) return false;
    try {
      await axios.delete(SummaryApi.deleteBanner(id).url, {
        withCredentials: true,
        headers: getAuthHeaders(),
      });
      dispatch(removeBanner(id));
      return true;
    } catch {
      return false;
    }
  };

  // 🔹 Select a banner
  const selectBanner = (banner) => dispatch(setSelectedBanner(banner));

  // Auto fetch on mount
  useEffect(() => {
    fetchBanners();
  }, []);

  return {
    bannerList,
    loading,
    fetchBanners,
    createBanner,
    updateBannerData,
    updateBannerStatus,
    deleteBannerById,
    selectBanner,
  };
};
