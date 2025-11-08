import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import socket from "@/socket";
import { addMessage, setMessages, clearMessages } from "@/store/chatSlice";
import axios from "axios";
import SummaryApi from "@/common";

export const useChatSocket = (user) => {
  const dispatch = useDispatch();
  const { messages } = useSelector((state) => state.chat);
  const isRegistered = useRef(false);
  const MAX_LOCAL_MESSAGES = 200;

  const lighten = (m) => {
    const sId = typeof m.senderId === "object" ? (m.senderId?._id || m.senderId?.id) : m.senderId;
    const rId = typeof m.receiverId === "object" ? (m.receiverId?._id || m.receiverId?.id) : m.receiverId;
    return {
      _id: m._id,
      text: m.text,
      createdAt: m.createdAt || m.updatedAt || new Date().toISOString(),
      senderId: String(sId || ""),
      receiverId: String(rId || ""),
      isRead: m.isRead ?? undefined,
    };
  };

  const safeSave = (key, arr) => {
    if (!Array.isArray(arr)) return;
    let slim = arr.slice(-MAX_LOCAL_MESSAGES).map(lighten);

    try {
      localStorage.setItem(key, JSON.stringify(slim));
      return;
    } catch (e1) {
      try {
        slim = slim.slice(-Math.floor(MAX_LOCAL_MESSAGES / 2));
        localStorage.setItem(key, JSON.stringify(slim));
        console.warn("⚠️ localStorage quota close — shrunk cache to", slim.length);
        return;
      } catch (e2) {
        try {
          sessionStorage.setItem(key, JSON.stringify(slim));
          console.warn("⚠️ Fell back to sessionStorage for chat cache");
          return;
        } catch {
          console.warn("⚠️ Could not persist chat cache (both stores full)");
        }
      }
    }
  };

  // ✅ Restore messages
  useEffect(() => {
    try {
      const saved =
        localStorage.getItem("chatMessages") || sessionStorage.getItem("chatMessages");
      if (saved && !messages.length) {
        const parsed = JSON.parse(saved);
        const slim = parsed.map(lighten).slice(-MAX_LOCAL_MESSAGES);
        dispatch(setMessages(slim));
        console.log("💾 Restored chat from storage:", slim.length);
      }
    } catch (err) {
      console.warn("⚠️ Failed to restore chatMessages:", err.message);
      localStorage.removeItem("chatMessages");
      sessionStorage.removeItem("chatMessages");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Fetch latest messages from backend
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (!user?._id) return;
        const adminId = import.meta.env.VITE_ADMIN_ID;
        const { data } = await axios.get(SummaryApi.getMessages(user._id, adminId).url);
        if (data?.success && Array.isArray(data.data)) {
          const storedRaw =
            localStorage.getItem("chatMessages") || sessionStorage.getItem("chatMessages");
          const stored = storedRaw ? JSON.parse(storedRaw) : [];
          const incomingSlim = data.data.map(lighten);

          const byId = new Map();
          [...stored, ...incomingSlim].forEach((m) => {
            if (m && m._id) byId.set(m._id, m);
          });

          const merged = Array.from(byId.values());
          merged.sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );

          const limited = merged.slice(-MAX_LOCAL_MESSAGES);
          dispatch(setMessages(limited));
          safeSave("chatMessages", limited);
          console.log("📩 Synced messages:", limited.length);
        }
      } catch (error) {
        console.error("⚠️ Error fetching messages:", error?.message || error);
      }
    };
    fetchMessages();
  }, [user?._id, dispatch]);

  // ✅ Auto-save to storage
  useEffect(() => {
    if (messages?.length > 0) {
      try {
        safeSave("chatMessages", messages);
      } catch {
        // handled inside safeSave
      }
    }
  }, [messages]);

  // ✅ Improved Socket Handling
  useEffect(() => {
    if (!user?._id) return;

    // ---- NEW: Always reset socket state ----
    if (socket.disconnected) socket.connect();
    if (!isRegistered.current) {
      socket.emit("register", { userId: user._id, userType: "ChatUser" });
      isRegistered.current = true;
      console.log(`🟢 Socket registered for user: ${user._id}`);
    }

    const onNewMessage = (msg) => {
      if (!msg || !msg._id) return;
      const myId = String(user._id);
      const sender =
        typeof msg.senderId === "object"
          ? msg.senderId?._id || msg.senderId?.id
          : msg.senderId;
      if (String(sender) === myId) return;
      dispatch(addMessage(lighten(msg)));
      const next = [...messages, lighten(msg)].slice(-MAX_LOCAL_MESSAGES);
      safeSave("chatMessages", next);
      console.log("💬 New message via socket:", msg.text);
    };

    const onSent = (msg) => {
      if (!msg?._id) return;
      const exists = messages.some((m) => m._id === msg._id);
      if (exists) return;
      const slim = lighten(msg);
      dispatch(addMessage(slim));
      const next = [...messages, slim].slice(-MAX_LOCAL_MESSAGES);
      safeSave("chatMessages", next);
      console.log("✅ message_sent:", msg.text);
    };

    const onReconnect = () => {
      console.log("🔁 Reconnected → re-registering user...");
      socket.emit("register", { userId: user._id, userType: "ChatUser" });
      isRegistered.current = true;
    };

    socket.on("new_message", onNewMessage);
    socket.on("message_sent", onSent);
    socket.on("reconnect", onReconnect);

    // ✅ Force online re-sync whenever modal reopens
    socket.emit("check_online_status");

    return () => {
      console.log("🔴 Socket cleanup & marking offline");
      socket.emit("mark_offline", { userId: user._id, userType: "ChatUser" });
      socket.off("new_message", onNewMessage);
      socket.off("message_sent", onSent);
      socket.off("reconnect", onReconnect);
      isRegistered.current = false; // 🔥 reset for next reopen
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id, dispatch, messages]);

  // ✅ Send message
  const sendMessage = (text, adminId) => {
    const msg = {
      senderType: "ChatUser",
      senderId: user._id,
      receiverType: "users",
      receiverId: adminId,
      text,
      status: "sent",
    };
    socket.emit("send_message", msg);
    console.log("📤 Message emitted, waiting for server confirmation...");
  };

  // ✅ Reset chat
  const resetChat = () => {
    dispatch(clearMessages());
    localStorage.removeItem("chatMessages");
    sessionStorage.removeItem("chatMessages");
    socket.removeAllListeners();
    isRegistered.current = false;
    console.log("🧹 Chat cleared & socket reset");
  };

  return { messages, sendMessage, resetChat };
};
