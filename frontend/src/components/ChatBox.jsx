import React, { useState, memo, useCallback, useRef, useEffect } from "react";
import { useChatAuth } from "@/customHooks/useChatAuth";
import { useChatSocket } from "@/customHooks/useChatSocket";
import { FiLogOut, FiSend } from "react-icons/fi";
import { IoMdClose } from "react-icons/io";
import axios from "axios";
import SummaryApi from "@/common";
import { AIChatSession } from "../components/AIModel";
import { Brain } from "lucide-react";
import socket from "@/socket";
import usePresence from "@/customHooks/usePresence";
import StatusDot from "@/components/StatusDot";
import { requestForToken, onMessageListener } from "../firebase";

// ---------------------------------------------------------------
// unchanged helper
const getAISuggestions = async (chatHistory) => {
  try {
    const recentMessages = chatHistory
      .slice(-5)
      .map((m) => `${m.senderId ? "User" : "Admin"}: ${m.text}`)
      .join("\n");

    const prompt = `
You are an intelligent assistant. Based on this conversation, suggest 3-4 helpful or natural next messages for the user to send.

Conversation:
${recentMessages}

Return plain text suggestions, each on a new line, without numbering.
    `;

    const result = await AIChatSession.sendMessage(prompt);
    const response = await result.response.text();
    return response
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  } catch (err) {
    console.error("Gemini Suggestion Error:", err);
    return [];
  }
};

// ---------------------------------------------------------------
// unchanged sub components
const StableInput = memo(({ type = "text", placeholder, value, onChange, disabled }) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    disabled={disabled}
    autoComplete="off"
    className={`w-full px-3 py-2 rounded-lg border text-white ${disabled ? "bg-[#334155]" : "bg-[#1e293b]"
      } placeholder-white`}
  />
));

const ChatMessages = memo(({ messages, user }) => {
  const ref = useRef();
  useEffect(() => ref.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-white">
      {messages.length === 0 ? (
        <p className="text-gray-400 text-center mt-20">No messages yet 👋</p>
      ) : (
        messages.map((m, i) => {
          const isUserMsg = m.senderId === user?._id || m.senderId?._id === user?._id;
          const senderLabel = isUserMsg ? "You" : "Admin";

          return (
            <div key={m._id || i} className={`flex ${isUserMsg ? "justify-end" : "justify-start"}`}>
              <div
                className={`relative max-w-[75%] px-3 py-1.5 rounded-xl shadow-sm ${isUserMsg
                  ? "bg-[#dcf8c6] text-black rounded-br-none"
                  : "bg-gray-200 text-gray-900 rounded-bl-none"
                  }`}
              >
                <div
                  className={`text-[11px] mb-0.5 ${isUserMsg ? "text-gray-600 text-right" : "text-gray-500"
                    }`}
                >
                  {senderLabel}
                </div>
                <div className="flex items-end justify-between gap-1">
                  <p className="text-[14px] leading-snug whitespace-pre-wrap break-words flex-1">
                    {m.text}
                  </p>
                  <span
                    className={`text-[10px] ml-2 ${isUserMsg ? "text-gray-500" : "text-gray-600"
                      } whitespace-nowrap`}
                  >
                    {new Date(m.createdAt || new Date()).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>
          );
        })
      )}
      <div ref={ref} />
    </div>
  );
});

const ChatInput = memo(({ value, setValue, onSend, messages, user }) => {
  const inputRef = useRef();
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => inputRef.current?.focus(), []);

  const handleAskAI = async () => {
    try {
      setLoadingAI(true);
      const stored = messages || JSON.parse(localStorage.getItem("chatMessages")) || [];
      const suggestions = await getAISuggestions(stored);
      setAiSuggestions(suggestions);
      setShowSuggestions(true);
      setLoadingAI(false);
    } catch (err) {
      console.error("AI Error:", err);
      setLoadingAI(false);
    }
  };

  const handleSuggestionClick = (text) => {
    setValue(text);
    setShowSuggestions(false);
  };

  const closeSuggestions = () => setShowSuggestions(false);

  return (
    <div className="relative border-t bg-white p-2 flex items-center gap-2">
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          const ADMIN_ID_ENV = import.meta.env.VITE_ADMIN_ID;
          if (socket && ADMIN_ID_ENV && user?._id) {
            socket.emit("typing", { from: user._id, to: ADMIN_ID_ENV });
          }
        }}
        onKeyDown={(e) => e.key === "Enter" && onSend()}
        placeholder="Type your message..."
        className="flex-1 px-3 py-2 border rounded-full outline-none text-sm text-black bg-gray-50"
      />
      <div className="relative flex flex-col items-center justify-end gap-3">
        <button
          onClick={handleAskAI}
          title="Ask AI for suggestions"
          className="absolute -top-17 right-2 w-9 h-9 rounded-full cursor-pointer border border-[#d4afd6] shadow-lg bg-gradient-to-br from-[#ffd607] via-[#ff7eb9] to-[#ffd607] animate-bling"
        >
          <Brain className="text-pink-600 animate-spin-slow" size={18} />
        </button>
        <button
          onClick={onSend}
          className="w-11 h-11 rounded-full bg-[#0060AF] text-white shadow-lg flex items-center justify-center hover:bg-[#004c8a] hover:scale-105 transition-transform duration-150"
        >
          <FiSend size={18} />
        </button>
      </div>

      {showSuggestions && (
        <div className="absolute bottom-24 right-2 bg-ai-suggest backdrop-blur-md border border-gray-200 shadow-2xl rounded-2xl w-64 p-3 z-50 animate-fadeIn">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              <img
                src="https://cdn-icons-png.flaticon.com/512/4712/4712108.png"
                alt="AI"
                className="w-5 h-5"
              />
              <h4 className="font-semibold text-gray-800 text-sm">AI Suggestions</h4>
            </div>
            <button
              onClick={closeSuggestions}
              className="text-gray-400 hover:text-red-500 transition"
              title="Close"
            >
              <IoMdClose size={18} />
            </button>
          </div>

          <div className="max-h-56 overflow-y-auto pr-1">
            {loadingAI ? (
              <p className="text-gray-500 text-sm animate-pulse">AI is thinking...</p>
            ) : aiSuggestions.length > 0 ? (
              aiSuggestions.map((s, i) => (
                <p
                  key={i}
                  onClick={() => handleSuggestionClick(s)}
                  className="p-2 mb-1 text-sm text-gray-800 bg-gray-50 hover:bg-blue-50 rounded-lg cursor-pointer border border-transparent hover:border-blue-200 transition-all duration-150"
                >
                  {s}
                </p>
              ))
            ) : (
              <p className="text-gray-400 text-sm">No suggestions found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

// ✅ Main Component
const ChatBox = memo(({ onClose }) => {
  const { user, loading, signUp, sendOtp, verifyOtp, login, logout } = useChatAuth();
  const { messages, sendMessage, resetChat } = useChatSocket(user);

  const [input, setInput] = useState("");
  const [activeTab, setActiveTab] = useState("signin");
  const [otpEmail, setOtpEmail] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [usePasswordInstead, setUsePasswordInstead] = useState(false);
  const [signinData, setSigninData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    profilePic: null,
  });
  const [fileError, setFileError] = useState("");

  const { admin } = usePresence({ mode: "user" });
  const ADMIN_ID = String(import.meta.env.VITE_ADMIN_ID || "").trim();

  const [onlineIds, setOnlineIds] = useState([]);
  const [adminEventOnline, setAdminEventOnline] = useState(null);
  const [typingStatus, setTypingStatus] = useState("");
  const typingTimeoutRef = useRef(null);

  // ✅ STEP 1: Ask for browser notification permission and setup Firebase listener
  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().then((perm) =>
          console.log("🔔 Notification permission:", perm)
        );
      }
    }

    // Firebase token registration + foreground listener
    requestForToken();

    onMessageListener()
      .then((payload) => {
        console.log("📩 Firebase Push Notification (User side):", payload);
        const { title, body } = payload.notification;

        // 🔔 Show notification
        new Notification(title, {
          body,
          icon: "/favicon.ico",
        });

        // 🎵 Play notification sound
        const sound = new Audio("/notification.mp3");
        sound.play().catch(() => { });
      })
      .catch((err) => console.error("Notification Error:", err));
  }, []);


  useEffect(() => {
    if (!user?._id) return;

    const handleOnlineUsers = (ids = []) => {
      const asStrings = (ids || []).map((x) => String(x).trim());
      setOnlineIds(asStrings);
    };

    const handlePresenceChange = (payload) => {
      if (payload?.targetType === "users" && String(payload.targetId).trim() === ADMIN_ID) {
        setAdminEventOnline(!!payload.isOnline);
      }
    };

    const onAdminStatus = (payload) => {
      const target = String(payload?.adminId || "").trim();
      if (!target || target === ADMIN_ID) {
        setAdminEventOnline(!!payload?.isOnline);
      }
    };

    const handleUserTyping = ({ from }) => {
      if (String(from) === ADMIN_ID) {
        setTypingStatus("Admin is typing...");
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setTypingStatus(""), 3000);
      }
    };

    socket.on("online_users", handleOnlineUsers);
    socket.on("presence_change", handlePresenceChange);
    socket.on("admin_status", onAdminStatus);
    socket.on("user_typing", handleUserTyping);
    // 🟢 Notification when Admin sends a message to this user
    socket.off("new_message"); // clear old listeners
    socket.on("new_message", (msg) => {
      // Check if this message is from Admin and sent to this user
      if (
        (msg.senderType === "Admin" || msg.senderType === "users") &&
        (msg.receiverId === user._id || msg.receiverId?._id === user._id)
      ) {
        // Don't show notification if user is already viewing the chat window
        if (document.hasFocus()) return;

        // Request notification permission if not already granted
        if (Notification.permission !== "granted") {
          Notification.requestPermission();
        }

        // 🔔 Play sound (put notification.mp3 in /public)
        const sound = new Audio("/notification.mp3");
        sound.play().catch(() => { });

        // 🪧 Show system notification
        const notification = new Notification("New message from Admin", {
          body: msg.text || "You have a new message",
          icon: "/favicon.ico", // change to your logo if needed
        });

        // Focus window when clicked
        notification.onclick = () => {
          window.focus();
        };
      }
    });


    // 🟢 Register user on socket connect
    socket.emit("register", { userId: user._id, userType: "ChatUser" });

    if (user?._id && socket.connected) {
      console.log("♻️ Modal reopened → Registering user + fetching online status");

      socket.emit("register", { userId: user._id, userType: "ChatUser" });

      // 🕐 Wait slightly longer for backend DB to update admin status after logout
      setTimeout(() => {
        socket.emit("check_online_status");
        socket.emit("force_admin_status_refresh");
      }, 300);
    }

    // ♻️ Periodic admin presence recheck (every 10 seconds)
    const interval = setInterval(() => {
      if (socket && socket.connected) {
        socket.emit("check_online_status");
        console.log("♻️ Forced admin status refresh sent to client");
      }
    }, 3000); // every 10 seconds


    return () => {
      clearInterval(interval);
      socket.off("online_users", handleOnlineUsers);
      socket.off("presence_change", handlePresenceChange);
      socket.off("admin_status", onAdminStatus);
      socket.off("user_typing", handleUserTyping);
      socket.off("new_message");
      clearTimeout(typingTimeoutRef.current);
    };

  }, [user?._id, ADMIN_ID]);


  const isOnlineBySocket = onlineIds.includes(ADMIN_ID);
  const isOnlineByEvent = adminEventOnline === true;
  const isOnlineByApi = !!admin?.isOnline;
  const isAdminOnline = isOnlineBySocket || isOnlineByEvent || isOnlineByApi;

  const handleSendMessage = useCallback(() => {
    if (!input.trim() || !user) return;
    const ADMIN_ID_ENV = import.meta.env.VITE_ADMIN_ID;
    sendMessage(input, ADMIN_ID_ENV);
    setInput("");
  }, [input, user, sendMessage]);

  const handleLogout = () => {
    try {
      // 1️⃣ Call your existing logout logic
      logout();
      resetChat();
      setInput("");

      // 2️⃣ Remove Firebase User FCM Token
      if (localStorage.getItem("userFcmToken")) {
        localStorage.removeItem("userFcmToken");
        console.log("🧹 User FCM token removed from localStorage");
      }

      // 3️⃣ Optional: remove any other chat-related cache
      localStorage.removeItem("chatMessages");
      localStorage.removeItem("userData");

      // 4️⃣ Optionally, refresh UI or close chat box after logout
      console.log("👋 User logged out successfully, all tokens cleared");
    } catch (error) {
      console.error("❌ Logout cleanup error:", error);
    }
  };

  // ✅ Add this here
  useEffect(() => {
    if (!user?._id) return; // only run if user is logged in

    const existingToken = localStorage.getItem("userFcmToken");
    if (existingToken) {
      console.log("📦 Loaded User Token from localStorage:", existingToken);
    } else {
      requestForToken().then((token) => {
        if (token) {
          console.log("✅ New User FCM Token:", token);
          localStorage.setItem("userFcmToken", token);
        }
      });
    }
  }, [user?._id]);

  // ---------------- AUTH (unchanged) ----------------
  if (!user) {
    return (
      <>
        <div className="bg-[#063b73] p-3 flex items-center justify-between border-b relative">
          <div>
            <div className="font-semibold text-white">Support Chat</div>
            <div className="text-xs text-white/80">We typically reply within 24 hours</div>
          </div>
          <button onClick={onClose} title="Close" className="text-xl font-bold text-white">
            <IoMdClose />
          </button>
        </div>

        {/* Auth Form */}
        <div className="p-4 flex flex-col gap-3 h-[calc(100%-60px)] overflow-y-auto text-white">
          {/* Tabs */}
          <div className="flex mb-3 border-b border-white/30">
            <button
              className={`flex-1 py-2 ${activeTab === "signin" ? "border-b-2 border-white font-semibold" : ""}`}
              onClick={() => setActiveTab("signin")}
            >
              Sign In
            </button>
            <button
              className={`flex-1 py-2 ${activeTab === "signup" ? "border-b-2 border-white font-semibold" : ""}`}
              onClick={() => setActiveTab("signup")}
            >
              Sign Up
            </button>
          </div>

          {/* Sign In */}
          {activeTab === "signin" && (
            <div className="flex flex-col gap-3">
              {!usePasswordInstead ? (
                !otpSent ? (
                  <div className="flex flex-col gap-2">
                    <StableInput
                      type="email"
                      placeholder="Email"
                      value={otpEmail}
                      onChange={(e) => setOtpEmail(e.target.value)}
                    />
                    <button
                      onClick={async () => {
                        if (!otpEmail.trim()) return alert("Enter your email");
                        await sendOtp(otpEmail);
                        setOtpSent(true);
                      }}
                      disabled={loading}
                      className="w-full bg-[#0060AF] py-2 rounded-lg text-white disabled:opacity-50"
                    >
                      {loading ? "Sending..." : "Send OTP"}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <StableInput type="email" value={otpEmail} disabled />
                    <StableInput
                      type="text"
                      placeholder="Enter OTP"
                      value={otpValue}
                      onChange={(e) => setOtpValue(e.target.value)}
                    />
                    <button
                      onClick={async () => {
                        if (!otpValue.trim()) return alert("Enter OTP");
                        await verifyOtp(otpEmail, otpValue);
                        setOtpValue("");
                        setOtpSent(false);

                        // ✅ Generate Firebase token after OTP verification (frontend only)
                        const token = await requestForToken();
                        if (token) {
                          console.log("✅ User FCM Token:", token);
                          localStorage.setItem("userFcmToken", token); // optional: store locally
                        }
                      }}
                      disabled={loading}
                      className="bg-green-600 py-2 rounded-lg text-white disabled:opacity-50"
                    >
                      {loading ? "Verifying..." : "Verify OTP"}
                    </button>
                  </div>
                )
              ) : (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      await login(signinData.email, signinData.password);

                      // ✅ Generate token after successful login
                      const token = await requestForToken();
                      if (token) {
                        console.log("✅ User FCM Token:", token);
                        localStorage.setItem("userFcmToken", token);
                      }
                    } catch (error) {
                      console.error("❌ Login or Token Error:", error);
                    }
                  }}
                  className="flex flex-col gap-2 mt-2"
                >

                  <StableInput
                    type="email"
                    placeholder="Email"
                    value={signinData.email}
                    onChange={(e) =>
                      setSigninData({ ...signinData, email: e.target.value })
                    }
                  />
                  <StableInput
                    type="password"
                    placeholder="Password"
                    value={signinData.password}
                    onChange={(e) =>
                      setSigninData({ ...signinData, password: e.target.value })
                    }
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#0060AF] py-2 rounded-lg text-white disabled:opacity-50"
                  >
                    {loading ? "Logging in..." : "Sign In"}
                  </button>
                </form>
              )}
              <p
                className="text-center text-white/80 text-sm mt-2 cursor-pointer hover:text-white transition"
                onClick={() => {
                  setUsePasswordInstead(!usePasswordInstead);
                  setOtpSent(false);
                  setOtpValue("");
                }}
              >
                {usePasswordInstead ? "Use OTP instead" : "Try with Password"}
              </p>
            </div>
          )}

          {/* Sign Up */}
          {activeTab === "signup" && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();

                try {
                  const formData = new FormData();
                  formData.append("name", signupData.name);
                  formData.append("email", signupData.email);
                  formData.append("password", signupData.password);

                  const file = signupData.profilePic;
                  if (file) {
                    const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
                    if (!allowed.includes(file.type)) {
                      setFileError("Only JPG, JPEG, PNG, or WEBP images are allowed.");
                      return;
                    }
                    if (file.size > 30 * 1024) {
                      setFileError("File too large. Max size is 30KB.");
                      return;
                    }
                    setFileError("");
                    formData.append("profilePic", file);
                  }

                  const res = await signUp(formData);
                  if (res) {
                    setActiveTab("signin");
                  }
                } catch (error) {
                  console.error("❌ Signup request failed:", error);
                }
              }}
              className="flex flex-col gap-2"
            >
              <StableInput
                placeholder="Full Name"
                value={signupData.name}
                onChange={(e) =>
                  setSignupData({ ...signupData, name: e.target.value })
                }
              />
              <StableInput
                placeholder="Email"
                value={signupData.email}
                onChange={(e) =>
                  setSignupData({ ...signupData, email: e.target.value })
                }
              />
              <StableInput
                type="password"
                placeholder="Password"
                value={signupData.password}
                onChange={(e) =>
                  setSignupData({ ...signupData, password: e.target.value })
                }
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setSignupData({
                    ...signupData,
                    profilePic: e.target.files[0],
                  })
                }
                className="w-full px-3 py-2 rounded-lg border text-white bg-[#1e293b]"
              />
              {fileError && <p className="text-red-400 text-xs">{fileError}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-[#0060AF] py-2 rounded-lg disabled:opacity-50"
              >
                {loading ? "Creating..." : "Sign Up"}
              </button>
            </form>
          )}
        </div>
      </>
    );
  }



  // ---------------- LOGGED IN ----------------
  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b flex items-center justify-between bg-[#063b73]">
        <div>
          <div className="font-semibold text-white flex items-center gap-2">
            Chat with Admin <StatusDot online={isAdminOnline} />
          </div>
          <div className="text-xs text-white/80">
            {typingStatus ? (
              <span className="text-green-300 animate-pulse">Typing...</span>
            ) : isAdminOnline ? (
              "Online"
            ) : (
              "Offline"
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleLogout} title="Logout" className="text-xl text-white hover:text-red-400 transition">
            <FiLogOut />
          </button>
          <button onClick={onClose} title="Close" className="text-2xl text-white hover:text-gray-300 transition">
            <IoMdClose />
          </button>
        </div>
      </div>

      <ChatMessages messages={messages} user={user} />
      <ChatInput value={input} setValue={setInput} onSend={handleSendMessage} messages={messages} user={user} />
    </div>
  );
});

export default ChatBox;