import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import socket from "@/socket";
import { addMessage } from "@/store/chatSlice";

export const useAdminChatSocket = (adminId) => {
  const dispatch = useDispatch();
  const { messages } = useSelector((state) => state.chat);
  const isRegistered = useRef(false);

  // ✅ 1️⃣ Register admin socket connection
  useEffect(() => {
    if (!adminId || isRegistered.current) return;

    socket.emit("register", { userId: adminId });
    isRegistered.current = true;
    console.log(`🟢 Admin socket registered: ${adminId}`);

    // ✅ 2️⃣ Listen for all incoming messages from ChatUsers
    socket.on("new_message", (msg) => {
      console.log("📨 Message received:", msg);
      dispatch(addMessage(msg));
    });

    socket.on("message_sent", (msg) => {
      console.log("📤 Admin message echoed:", msg);
      dispatch(addMessage(msg));
    });

    socket.on("reconnect", () => {
      socket.emit("register", { userId: adminId });
      console.log("🔁 Admin socket reconnected");
    });

    return () => {
      socket.off("new_message");
      socket.off("message_sent");
      socket.off("reconnect");
      isRegistered.current = false;
      console.log("🔴 Admin socket cleaned up");
    };
  }, [adminId, dispatch]);

  return {
    messages,
  };
};
