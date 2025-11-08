import React, { useState, useEffect, useRef } from "react";
import { FiSearch, FiSend, FiMenu, FiX } from "react-icons/fi";
import { IoMdChatbubbles } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import socket from "@/socket";
import axios from "axios";
import SummaryApi from "@/common";
import { setMessages, addMessage } from "@/store/chatSlice";
import { motion, AnimatePresence } from "framer-motion";
import { Brain } from "lucide-react";
import { AIChatSession } from "../components/AIModel";
import { requestForToken, onMessageListener } from "../firebase";


// 🎨 Utility Functions
const getColorFromName = (name = "") => {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-indigo-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-teal-500",
    "bg-orange-500",
    "bg-cyan-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const getInitials = (name = "") => {
  if (!name) return "U";
  const parts = name.split(" ");
  return parts.length === 1
    ? name.slice(0, 2).toUpperCase()
    : (parts[0][0] + parts[1][0]).toUpperCase();
};

const getDisplayName = (chat) => {
  if (!chat) return "User";
  if (typeof chat !== "object") return "User";
  const name =
    chat.chatName || chat.name || chat.username || chat.email || "User";
  return name.toString();
};

const getFullImageUrl = (url) => {
  if (!url) return "";
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
  if (url.startsWith("http")) return url;
  return `${backendUrl}${url.startsWith("/") ? url : `/${url}`}`;
};

// ✨ Highlight Matching Text
const highlightMatchedText = (text = "", query = "") => {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <span
        key={i}
        className="bg-[#fff59d] text-gray-900 rounded-sm px-0.5 transition-all duration-150"
      >
        {part}
      </span>
    ) : (
      part
    )
  );
};

const AdminChatDashboard = () => {
  const [chatUsers, setChatUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);
  const [input, setInput] = useState("");
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);


  // 🧠 AI States
  const [showAIBox, setShowAIBox] = useState(false);
  const [AISuggestions, setAISuggestions] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);

  const [typingUser, setTypingUser] = useState(null); // when user typing
  const [adminTyping, setAdminTyping] = useState(false); // when admin typing
  const typingTimeoutRef = useRef(null);


  const dispatch = useDispatch();
  const { messages } = useSelector((state) => state.chat);
  const adminId = import.meta.env.VITE_ADMIN_ID;
  const scrollRef = useRef();
  const registeredRef = useRef(false);

  // COMMIT: presence ids set (authoritative list of online ChatUsers)
  const [onlineIds, setOnlineIds] = useState([]);
  const [chatSummary, setChatSummary] = useState({}); // 🆕 summary (recent msg + unread)

  // ✅ STEP 1: Ask for notification permission when admin loads dashboard
  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().then((perm) => {
          console.log("🔔 Notification permission:", perm);
        });
      }
    }
  }, []);

  // ✅ STEP 2: Firebase Cloud Messaging listener
  useEffect(() => {
    const getAdminFcmToken = async () => {
      const token = await requestForToken();
      if (token) {
        console.log("🔑 Admin FCM Token:", token);
        localStorage.setItem("adminFcmToken", token);
      } else {
        console.warn("⚠️ No FCM token generated for admin");
      }
    };

    getAdminFcmToken();

    onMessageListener()
      .then((payload) => {
        console.log("📩 Firebase Push Notification:", payload);
        const { title, body } = payload.notification;

        new Notification(title, {
          body,
          icon: "/favicon.ico",
        });

        const sound = new Audio("/notification.mp3");
        sound.play().catch(() => { });
      })
      .catch((err) => console.error("Notification Error:", err));
  }, []);


  // ============================================================
  // ✅ 1️⃣ Admin Socket Registration + Presence Emit
  // ============================================================
  useEffect(() => {
    if (!adminId || registeredRef.current) return;

    const registerAdmin = () => {
      socket.emit("register", { userId: adminId, userType: "Admin" });
      socket.emit("admin_status", { adminId, isOnline: true }); // ✅ correct
      console.log("🟢 Admin Registered & Online:", adminId);
    };

    // Register when socket connected
    if (socket.connected) registerAdmin();
    socket.on("connect", registerAdmin);
    socket.on("reconnect", registerAdmin);

    registeredRef.current = true;

    // Handle manual disconnect
    const handleDisconnect = (reason) => {
      console.log("🔴 Admin disconnected:", reason);

      const adminId = import.meta.env.VITE_ADMIN_ID; // ✅ Ensure backend knows which admin

      // Tell backend admin is offline
      socket.emit("admin_status", { adminId, isOnline: false });

      // Then safely disconnect socket
      socket.disconnect(); // 🚨 Force backend to trigger disconnect handler
    };
    socket.on("disconnect", handleDisconnect);


    // Cleanup on unmount
    return () => {
      socket.emit("admin_status", { isOnline: false });
      socket.off("connect", registerAdmin);
      socket.off("reconnect", registerAdmin);
      socket.off("disconnect", handleDisconnect);
      registeredRef.current = false;
      console.log("🧹 Admin socket cleaned up");
    };
  }, [adminId]);

  // ============================================================
  // ✅ 2️⃣ Emit offline when window closed / refreshed
  // ============================================================
  useEffect(() => {
    const handleBeforeUnload = () => {
      socket.emit("admin_status", { isOnline: false });
      socket.disconnect();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // COMMIT: 2.1️⃣ Presence listeners for ChatUsers (snapshot + delta)
  useEffect(() => {
    const onSnapshot = (payload) => {
      // payload: { users: [{ _id, isOnline, ...}] }
      const ids =
        (payload?.users || [])
          .filter((u) => u?.isOnline)
          .map((u) => String(u._id)) ?? [];
      setOnlineIds(ids);
    };

    const onPresenceChange = ({ targetType, targetId, isOnline }) => {
      if (targetType !== "ChatUser" || !targetId) return;
      setOnlineIds((prev) => {
        const s = new Set(prev);
        const id = String(targetId);
        if (isOnline) s.add(id);
        else s.delete(id);
        return Array.from(s);
      });
    };

    socket.on("initial_presence_snapshot", onSnapshot);
    socket.on("presence_change", onPresenceChange);

    return () => {
      socket.off("initial_presence_snapshot", onSnapshot);
      socket.off("presence_change", onPresenceChange);
    };
  }, []);

  // ============================================================
  // 🟢 Fetch All Users
  // ============================================================
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get(SummaryApi.getChatUsers.url);
        if (data?.success) {
          const cleaned = data.data.filter((u) => u && u._id);
          setChatUsers(cleaned);
          setFilteredUsers(cleaned);
        }
      } catch (err) {
        console.error("❌ Error fetching users:", err.message);
      }
    };
    fetchUsers();
  }, []);

  // 🆕 Fetch Chat Summary for Admin (last message + unread count)
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const { data } = await axios.get(SummaryApi.getChatSummary(adminId).url);
        if (data?.success) {
          setChatSummary(
            data.data.reduce((acc, item) => {
              acc[String(item._id)] = {
                lastMessage: item.lastMessage,
                unreadCount: item.unreadCount,
                lastTime: item.lastTime,
              };
              return acc;
            }, {})
          );
          console.log("🟢 Chat summary loaded:", data.data);
        }
      } catch (err) {
        console.error("❌ Error fetching chat summary:", err.message);
      }
    };

    if (adminId) fetchSummary();
  }, [adminId]);



  // 🔍 Realtime Search
  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      setFilteredUsers(chatUsers);
      return;
    }
    const filtered = chatUsers.filter((chat) => {
      const name = chat.chatName || chat.name || chat.username || chat.email || "";
      return name.toLowerCase().includes(term);
    });
    setFilteredUsers(filtered);
  }, [searchTerm, chatUsers]);

  // 🧠 Real-Time Events
  useEffect(() => {
    socket.on("new_user_registered", (newUser) => {
      if (!newUser || typeof newUser !== "object") return;
      const safeUser = {
        _id: newUser._id || Date.now().toString(),
        chatName: newUser.chatName || newUser.name || "Unnamed User",
        email: newUser.email || "unknown@example.com",
        profilePic: newUser.profilePic || "",
      };
      setChatUsers((prev) => {
        const exists = prev.some((u) => u._id === safeUser._id);
        return exists ? prev : [safeUser, ...prev];
      });
    });

    socket.on("user_deleted", ({ userId }) => {
      if (!userId) return;
      setChatUsers((prev) => prev.filter((u) => u._id !== userId));
      if (selectedChat?._id === userId) setSelectedChat(null);
    });

    return () => {
      socket.off("new_user_registered");
      socket.off("user_deleted");
    };
  }, [selectedChat]);

  // 🟢 Fetch Messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat?._id) return;
      try {
        const { data } = await axios.get(
          SummaryApi.getMessages(selectedChat._id, adminId).url
        );
        if (data?.success) dispatch(setMessages(data.data));
      } catch (err) {
        console.error("❌ Error fetching messages:", err.message);
      }
    };
    fetchMessages();
  }, [selectedChat, dispatch, adminId]);

  // 💬 Socket Chat Listener
  // 💬 Socket Chat Listener + Typing Indicator
  useEffect(() => {
    socket.off("new_message");
    socket.off("user_typing");
    socket.off("typing");

    socket.on("new_message", (msg) => {
      if (
        msg.senderId === selectedChat?._id ||
        msg.senderId?._id === selectedChat?._id
      ) {
        dispatch(addMessage(msg));
      }

      // ✅ STEP 2: Show notification if message is from user
      if (msg.senderId !== adminId && "Notification" in window) {
        if (Notification.permission === "granted") {
          const senderName =
            msg.senderId?.chatName ||
            msg.senderId?.name ||
            msg.senderId?.email ||
            "User";

          // Optional sound alert 🎵
          const sound = new Audio("/notification.mp3");
          sound.play().catch(() => { });

          // Browser notification
          const notification = new Notification(`New message from ${senderName}`, {
            body: msg.text || "New message received",
            icon: "/favicon.ico", // 🔄 Replace with your logo if needed
          });

          // 🪟 When admin clicks notification → focus and open chat
          notification.onclick = () => {
            window.focus();
            // ✅ small fix: use latest chat list reference safely
            setSelectedChat((prev) => {
              const found = chatUsers.find(
                (u) => String(u._id) === String(msg.senderId?._id || msg.senderId)
              );
              return found || prev;
            });
          };
        } else if (Notification.permission === "default") {
          Notification.requestPermission();
        }
      }

      if (msg.senderId !== adminId) {
        setChatSummary((prev) => {
          const updated = structuredClone(prev);
          const id = String(msg.senderId?._id || msg.senderId);

          updated[id] = {
            ...(updated[id] || {}),
            lastMessage: msg.text,
            lastTime: msg.createdAt || new Date().toISOString(),
            unreadCount:
              selectedChat?._id === id ? 0 : (updated[id]?.unreadCount || 0) + 1,
          };

          return updated;
        });

        // 🟢 Move sender to top of chat list instantly
        setChatUsers((prev) => {
          const id = String(msg.senderId?._id || msg.senderId);
          const existing = prev.find((u) => String(u._id) === id);
          if (!existing) return prev;
          const others = prev.filter((u) => String(u._id) !== id);
          return [existing, ...others];
        });
      }
    });

    // ✅ Typing event stays same
    socket.on("user_typing", ({ from }) => {
      if (String(from) === String(selectedChat?._id)) {
        setTypingUser(true);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setTypingUser(false), 1500);
      }
    });

    return () => {
      socket.off("new_message");
      socket.off("user_typing");
    };
  }, [selectedChat, dispatch, chatUsers]);



  // ✍️ Send Message
  const handleSend = () => {
    if (!input.trim() || !selectedChat?._id) return;
    const msg = {
      senderType: "users",
      senderId: adminId,
      receiverType: "ChatUser",
      receiverId: selectedChat._id,
      text: input.trim(),
    };
    socket.emit("send_message", msg);
    dispatch(addMessage({ ...msg, createdAt: new Date().toISOString() }));
    setInput("");
    setShowAIBox(false);
  };

  // 🧠 Admin typing indicator emitter
  const handleTyping = () => {
    if (!selectedChat?._id) return;
    socket.emit("typing", { from: adminId, to: selectedChat._id });
    setAdminTyping(true);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => setAdminTyping(false), 1500);
  };


  const isAdminMsg = (msg) =>
    msg.senderId === adminId ||
    msg.senderType === "Admin" ||
    msg.senderType === "users";

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🧠 commit: AI Suggestion Function
  const handleAISuggestions = async () => {
    try {
      setLoadingAI(true);
      const recent = messages
        .slice(-7)
        .map(
          (m) => `${m.senderId === adminId ? "Admin" : "User"}: ${m.text}`
        )
        .join("\n");

      const prompt = `
You are a multilingual smart conversational AI assistant.
Detect the main language of the conversation (Hindi, Hinglish, or English)
and reply in the same language and tone.
Generate 4–5 short, friendly, and context-aware reply suggestions the Admin might send next.
Conversation:
${recent}
Return plain text suggestions, each separated by a newline.
Do not number or label them.`;

      const res = await AIChatSession.sendMessage(prompt);
      const text = await res.response.text();
      const suggestions = text
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      setAISuggestions(suggestions);
      setShowAIBox(true);
      setLoadingAI(false);
    } catch (err) {
      console.error("AI Error:", err);
      setLoadingAI(false);
    }
  };

  // COMMIT: derived presence for header
  const isSelectedOnline = selectedChat?._id
    ? onlineIds.includes(String(selectedChat._id))
    : false;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden relative">
      {/* Sidebar */}
      <aside
        className={`bg-white shadow-lg flex flex-col h-full z-20 transition-all duration-500 ease-in-out ${isSidebarVisible ? "w-72" : "w-0 overflow-hidden"
          }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-lg font-bold text-blue-600 flex items-center gap-2">
            <IoMdChatbubbles /> Admin Chat
          </h1>
        </div>

        {/* 🔍 Search */}
        <div className="p-3 border-b flex items-center bg-gray-50">
          <FiSearch className="text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent outline-none text-sm"
          />
        </div>

        {/* Chat List */}
        <div className="overflow-y-auto flex-1">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((chat) => {
              const name = getDisplayName(chat);
              const initials = getInitials(name);
              const color = getColorFromName(name);
              const profileUrl = getFullImageUrl(chat.profilePic);
              const online = onlineIds.includes(String(chat._id));
              const summary = chatSummary[chat._id] || {};
              const lastMsg = summary.lastMessage || "";
              const unread = summary.unreadCount || 0;

              return (
                <div
                  key={chat._id}
                  onClick={async () => {
                    if (!chat?._id || !adminId) return; // ✅ Prevent null/undefined crash

                    try {
                      // 1️⃣ Update selection immediately for UI
                      setSelectedChat(chat);
                      setSearchTerm("");

                      // 2️⃣ Mark all as read in backend
                      await axios.put(SummaryApi.markMessagesRead(chat._id, adminId).url);

                      // 3️⃣ Reset unread count & clear last msg/time safely
                      setChatSummary((prev) => ({
                        ...prev,
                        [chat._id]: {
                          ...prev[chat._id],
                          unreadCount: 0,
                          lastMessage: "",
                          lastTime: "",
                        },
                      }));

                      console.log(`✅ Marked messages as read for ${chat._id}`);
                    } catch (err) {
                      console.error("❌ Failed to mark as read:", err.message);
                    }
                  }}
                  className={`flex items-center justify-between px-4 py-3 border-b cursor-pointer hover:bg-gray-50 transition-all ${selectedChat?._id === chat._id
                    ? "bg-blue-50 border-l-4 border-blue-600"
                    : ""
                    }`}
                >
                  {/* LEFT: Avatar + Info */}
                  <div className="flex items-center gap-3 flex-1">
                    {profileUrl ? (
                      <img
                        src={profileUrl}
                        alt={name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${color}`}
                      >
                        {initials}
                      </div>
                    )}

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-semibold text-gray-800">
                          {highlightMatchedText(name, searchTerm)}
                        </h2>

                        {/* 🟢 Online Dot */}
                        <span
                          className={`inline-block w-2.5 h-2.5 rounded-full ${online ? "bg-green-500" : "bg-gray-300"
                            }`}
                          title={online ? "Online" : "Offline"}
                        />
                      </div>

                      {/* 📨 Last Message below name */}
                      <p className="text-[12px] text-gray-500 truncate max-w-[160px]">
                        {chatSummary[chat._id]?.lastMessage || ""}
                      </p>
                    </div>
                  </div>

                  {/* RIGHT: Time above Unread Count */}
                  <div className="flex flex-col items-end justify-between ml-2">
                    {/* 🕓 Time */}
                    {chatSummary[chat._id]?.lastTime && (
                      <p className="text-[11px] text-gray-400 mb-1">
                        {(() => {
                          const dateStr = chatSummary[chat._id].lastTime;
                          if (!dateStr) return "";
                          const date = new Date(
                            dateStr.includes("T")
                              ? dateStr
                              : dateStr.replace(" ", "T") + "+05:30"
                          );
                          const now = new Date();
                          const isToday = date.toDateString() === now.toDateString();
                          const isYesterday =
                            new Date(now - 86400000).toDateString() === date.toDateString();

                          if (isToday)
                            return date.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            });
                          if (isYesterday) return "Yesterday";
                          return date.toLocaleDateString([], {
                            day: "2-digit",
                            month: "short",
                          });
                        })()}
                      </p>
                    )}

                    {/* 🔴 Unread Count below time */}
                    {chatSummary[chat._id]?.unreadCount > 0 && (
                      <span className="inline-flex items-center justify-center bg-red-500 text-white text-[10px] font-semibold w-5 h-5 rounded-full shadow-sm">
                        {chatSummary[chat._id].unreadCount}
                      </span>
                    )}
                  </div>
                </div>





              );
            })
          ) : (
            <p className="text-gray-500 text-center mt-4 text-sm">No users found</p>
          )}
        </div>

      </aside>

      {/* Chat Window */}
      <main
        className={`flex flex-col h-full min-h-0 bg-gray-50 transition-all ${isSidebarVisible ? "md:w-[calc(100%-18rem)]" : "w-full"
          }`}
      >
        {/* Header */}
        <div className="flex-none flex items-center justify-between p-4 border-b bg-white shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarVisible(!isSidebarVisible)}
              className="text-gray-700 hover:text-blue-600"
            >
              {isSidebarVisible ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>

            {selectedChat && (
              <>
                {selectedChat?.profilePic ? (
                  <img
                    src={getFullImageUrl(selectedChat?.profilePic)}
                    alt={getDisplayName(selectedChat)}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${getColorFromName(
                      getDisplayName(selectedChat)
                    )}`}
                  >
                    {getInitials(getDisplayName(selectedChat))}
                  </div>
                )}
                <div>
                  <h2 className="font-semibold text-gray-800">
                    {getDisplayName(selectedChat)}
                  </h2>
                  {/* COMMIT: live presence in header */}
                  <p
                    className={`text-xs ${typingUser
                      ? "text-blue-500 animate-pulse"
                      : adminTyping
                        ? "text-blue-500 animate-pulse"
                        : isSelectedOnline
                          ? "text-green-500"
                          : "text-gray-400"
                      }`}
                  >
                    {typingUser
                      ? "Typing..."
                      : adminTyping
                        ? "Typing..."
                        : isSelectedOnline
                          ? "Online"
                          : "Offline"}
                  </p>


                </div>
              </>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex flex-col flex-1 overflow-hidden min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50 space-y-2 min-h-0">
            {!selectedChat ? (
              <p className="text-center text-gray-400 mt-10">
                Select a user to start chat
              </p>
            ) : messages.length === 0 ? (
              <p className="text-center text-gray-400 mt-10">No messages yet</p>
            ) : (
              messages.map((msg, i) => {
                const isAdmin = isAdminMsg(msg);
                const senderName = isAdmin ? "You" : getDisplayName(selectedChat);
                return (
                  <motion.div
                    key={msg._id || i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`relative max-w-[75%] px-3 py-1.5 rounded-xl shadow-sm ${isAdmin
                        ? "bg-[#dcf8c6] text-black rounded-br-none"
                        : "bg-gray-200 text-gray-900 rounded-bl-none"
                        }`}
                    >
                      <div
                        className={`text-[11px] mb-0.5 ${isAdmin ? "text-gray-600 text-right" : "text-gray-500"
                          }`}
                      >
                        {senderName}
                      </div>
                      <div className="flex items-end justify-between gap-1">
                        <p className="text-[14px] leading-snug whitespace-pre-wrap break-words flex-1">
                          {msg.text}
                        </p>
                        <span
                          className={`text-[10px] ml-2 ${isAdmin ? "text-gray-500" : "text-gray-600"
                            } whitespace-nowrap`}
                        >
                          {new Date(msg.createdAt || new Date()).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
            <div ref={scrollRef} />
          </div>

          {/* Input + AI Suggestion */}
          {selectedChat && (
            <div className="p-3 bg-white border-t flex items-center relative">
              <input
                type="text"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  handleTyping();
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 border rounded-full px-4 py-2 text-sm outline-none"
              />

              <div className="relative flex flex-col items-center justify-end ml-2">
                {/* AI Suggestion Button */}
                <button
                  onClick={handleAISuggestions}
                  title="Ask AI for suggestions"
                  className="absolute -top-18 right-2 w-9 h-9 rounded-full bg-gradient-to-br from-[#ffd607] to-[#ff9efc]
                             border border-[#d4afd6] shadow-lg flex items-center justify-center 
                             hover:scale-110 transition-transform duration-200 cursor-pointer animate-bling"
                >
                  <Brain className="text-pink-600 animate-spin-slow" size={18} />
                </button>

                {/* Send Button */}
                <button
                  onClick={handleSend}
                  className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center"
                >
                  <FiSend size={18} />
                </button>
              </div>

              {/* AI Suggestion Popup */}
              {showAIBox && (
                <div className="absolute bottom-16 right-3 bg-white border border-gray-200 
                                shadow-2xl rounded-xl w-64 p-3 z-50 animate-fadeIn">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                      <Brain className="text-pink-600" size={16} />
                      <h4 className="font-semibold text-gray-800 text-sm">
                        AI Suggestions
                      </h4>
                    </div>
                    <button
                      onClick={() => setShowAIBox(false)}
                      className="text-gray-400 hover:text-red-500 transition"
                    >
                      <FiX size={16} />
                    </button>
                  </div>

                  <div className="max-h-56 overflow-y-auto pr-1">
                    {loadingAI ? (
                      <p className="text-gray-500 text-sm animate-pulse">
                        AI is thinking...
                      </p>
                    ) : AISuggestions.length > 0 ? (
                      AISuggestions.map((s, i) => (
                        <p
                          key={i}
                          onClick={() => {
                            setInput(s);
                            setShowAIBox(false);
                          }}
                          className="p-2 mb-1 text-sm text-gray-800 bg-gray-50 hover:bg-blue-50 
                                     rounded-lg cursor-pointer border border-transparent hover:border-blue-200 transition-all duration-150"
                        >
                          {s}
                        </p>
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm">
                        No suggestions found
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminChatDashboard;
