// src/customHooks/useTimeLine.js
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import SummaryApi, { getAuthHeaders } from "@/common";
import {
  setTimelineList,
  addTimeline,
  updateTimeline,
  removeTimeline,
  setLoading,
  setError,
  setSelectedTimeline,
} from "@/store/timeLineSlice";

/**
 * useTimeline (plain JS - no JSX, returns result objects)
 */
export const useTimeline = () => {
  const dispatch = useDispatch();
  const { timelineList, loading } = useSelector((state) => state.timeline);

  // prevent double fetch in StrictMode
  const isFetching = useRef(false);

  // Fetch
  const fetchTimeline = async () => {
    if (isFetching.current) return;
    isFetching.current = true;
    try {
      dispatch(setLoading(true));
      const res = await axios.get(SummaryApi.getAllTimelines.url, {
        withCredentials: true,
        headers: getAuthHeaders(),
      });
      if (res?.data?.success) {
        dispatch(setTimelineList(res.data.data));
        return { success: true, data: res.data.data };
      } else {
        dispatch(setError("Failed to fetch timeline entries"));
        return { success: false, message: "Failed to fetch timeline entries" };
      }
    } catch (err) {
      dispatch(setError("Error fetching timeline entries"));
      return { success: false, message: "Error fetching timeline entries" };
    } finally {
      dispatch(setLoading(false));
      isFetching.current = false;
    }
  };

  // Create
  const createTimeline = async (data) => {
    try {
      const res = await axios.post(SummaryApi.createTimeline.url, data, {
        withCredentials: true,
        headers: getAuthHeaders(),
      });
      if (res?.data?.success) {
        dispatch(addTimeline(res.data.data));
        return { success: true, message: "Timeline created", data: res.data.data };
      } else {
        return { success: false, message: res?.data?.message || "Failed to create timeline" };
      }
    } catch (err) {
      return { success: false, message: "Error creating timeline" };
    }
  };

  // Update (returns result, DOES NOT toast)
  const updateTimelineData = async (id, data) => {
    try {
      const res = await axios.put(SummaryApi.updateTimeline(id).url, data, {
        withCredentials: true,
        headers: getAuthHeaders(),
      });
      if (res?.data?.success) {
        dispatch(updateTimeline(res.data.data));
        return { success: true, message: "Timeline updated", data: res.data.data };
      } else {
        return { success: false, message: res?.data?.message || "Failed to update timeline" };
      }
    } catch (err) {
      return { success: false, message: "Error updating timeline" };
    }
  };

  // Update status (Active/Inactive) - uses API directly and returns result
  const updateTimelineStatus = async (id, isActive) => {
    try {
      const res = await axios.put(
        SummaryApi.updateTimeline(id).url,
        { isActive },
        { withCredentials: true, headers: getAuthHeaders() }
      );
      if (res?.data?.success) {
        dispatch(updateTimeline(res.data.data));
        return { success: true, message: `Status updated to ${isActive ? "Active" : "Inactive"}`, data: res.data.data };
      } else {
        return { success: false, message: res?.data?.message || "Failed to update status" };
      }
    } catch (err) {
      return { success: false, message: "Error updating status" };
    }
  };

  // Delete - no JSX here; uses window.confirm (component can call or you can call this and handle result)
  const deleteTimelineById = async (id, useConfirm = true) => {
    if (useConfirm) {
      const ok = window.confirm("Are you sure you want to delete this timeline entry?");
      if (!ok) return { success: false, message: "Cancelled" };
    }

    try {
      const res = await axios.delete(SummaryApi.deleteTimeline(id).url, {
        withCredentials: true,
        headers: getAuthHeaders(),
      });
      if (res?.data?.success) {
        dispatch(removeTimeline(id));
        return { success: true, message: "Timeline deleted" };
      } else {
        // re-fetch to keep state consistent
        await fetchTimeline();
        return { success: false, message: res?.data?.message || "Failed to delete timeline" };
      }
    } catch (err) {
      await fetchTimeline();
      return { success: false, message: "Error deleting timeline" };
    }
  };

  // Select
  const selectTimeline = (timeline) => {
    dispatch(setSelectedTimeline(timeline));
    return { success: true, data: timeline };
  };

  // initial fetch
  useEffect(() => {
    fetchTimeline();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    timelineList,
    loading,
    fetchTimeline,
    createTimeline,
    updateTimelineData,
    updateTimelineStatus,
    deleteTimelineById,
    selectTimeline,
  };
};
