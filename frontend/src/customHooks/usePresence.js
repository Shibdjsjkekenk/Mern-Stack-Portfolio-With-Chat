import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import socket from "@/socket";
import SummaryApi from "@/common";

// ⏱ formatter
export const formatLastActive = (lastActive, isOnline) => {
  if (isOnline) return "Online";
  if (!lastActive) return "Offline";
  const diffMs = Date.now() - new Date(lastActive).getTime();
  const m = Math.floor(diffMs / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (m < 1) return "Active just now";
  if (m < 60) return `Active ${m} min ago`;
  if (h < 24) return `Active ${h} hr ago`;
  return `Active ${d} day${d > 1 ? "s" : ""} ago`;
};

/**
 * mode: "user"  -> end-user chat box me admin ka status dikhana
 * mode: "admin" -> admin dashboard me users ke status dikhana
 */
export default function usePresence({ mode = "user" } = {}) {
  const [admin, setAdmin] = useState({ isOnline: false, lastActive: null, _id: null });
  const [usersMap, setUsersMap] = useState({}); // { userId: {isOnline,lastActive,chatName,profilePic} }

  // initial fetch (debug/presence or your dedicated endpoints)
  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        if (mode === "user") {
          // Admin presence (you can replace with a dedicated endpoint if you have one)
          const { data } = await axios.get(`${SummaryApi.backendDomin}/api/debug/presence`);
          const adminData = data?.admins?.[0];
          if (mounted && adminData) {
            setAdmin({
              _id: adminData._id,
              isOnline: !!adminData.isOnline,
              lastActive: adminData.lastActive || null,
            });
          }
        } else {
          // Admin mode: get all chat users w/ status
          const { data } = await axios.get(SummaryApi.getChatUsers.url);
          // Expecting array like [{_id, chatName, profilePic, isOnline, lastActive}, ...]
          if (mounted && Array.isArray(data?.data || data)) {
            const map = {};
            (data.data || data).forEach(u => {
              map[u._id] = {
                chatName: u.chatName,
                profilePic: u.profilePic,
                isOnline: !!u.isOnline,
                lastActive: u.lastActive || null,
              };
            });
            setUsersMap(map);
          }
        }
      } catch (e) {
        console.warn("Presence bootstrap failed:", e.message);
      }
    };

    bootstrap();

    // socket listeners
    if (mode === "user") {
      // admin online/offline ping
      const onAdminStatus = (payload) => {
        // payload: { adminId, isOnline }
        setAdmin(prev => ({ ...prev, isOnline: !!payload.isOnline }));
      };
      const onPresenceChange = (payload) => {
        // backend might also emit presence_change for admin
        if (payload?.targetType === "users") {
          setAdmin(prev => ({
            ...prev,
            _id: payload.targetId || prev._id,
            isOnline: !!payload.isOnline,
            lastActive: payload.lastActive ?? prev.lastActive
          }));
        }
      };

      socket.on("admin_status", onAdminStatus);
      socket.on("presence_change", onPresenceChange);

      return () => {
        socket.off("admin_status", onAdminStatus);
        socket.off("presence_change", onPresenceChange);
      };
    } else {
      // admin dashboard: listen all chat user presence updates
      const onPresenceChange = ({ targetType, targetId, isOnline, lastActive }) => {
        if (targetType !== "ChatUser" || !targetId) return;
        setUsersMap(prev => ({
          ...prev,
          [targetId]: { ...(prev[targetId] || {}), isOnline: !!isOnline, lastActive: lastActive ?? prev[targetId]?.lastActive }
        }));
      };
      socket.on("presence_change", onPresenceChange);
      return () => socket.off("presence_change", onPresenceChange);
    }
  }, [mode]);

  return useMemo(() => {
    return mode === "user"
      ? { admin, adminText: formatLastActive(admin.lastActive, admin.isOnline) }
      : { usersMap, formatLastActive };
  }, [mode, admin, usersMap]);
}
