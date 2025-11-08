import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import socket from "@/socket";
import { addMessage, incrementUnread } from "@/store/chatSlice";
import ROLE from "../common/role";

/**
 * ✅ Global Socket Manager
 * Handles single socket connection for both Admin & ChatUser.
 */
export const useSocketManager = ({ userId, role = ROLE.GENERAL }) => {
  const dispatch = useDispatch();
  const isRegistered = useRef(false);

  useEffect(() => {
    if (!userId || isRegistered.current) return;

    // 🟢 Register this client
    socket.emit("register", { userId });
    isRegistered.current = true;
    console.log(`🟢 Socket registered as ${role}: ${userId}`);

    // 💬 Handle new incoming messages
    const handleNewMessage = (msg) => {
      console.log("💬 Message via global socket:", msg);
      dispatch(addMessage(msg));

      // ✅ Increment unread only if message is from the opposite user
      if (msg.senderId !== userId) {
        dispatch(incrementUnread());
      }
    };

    // 🔁 Handle reconnect
    const handleReconnect = () => {
      socket.emit("register", { userId });
      console.log("🔁 Socket reconnected:", userId);
    };

    // 🔗 Event listeners
    socket.on("new_message", handleNewMessage);
    socket.on("reconnect", handleReconnect);

    // 🧹 Cleanup
    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("reconnect", handleReconnect);
      isRegistered.current = false;
      console.log(`🔴 Socket cleaned up for ${userId}`);
    };
  }, [userId, role, dispatch]);
};
