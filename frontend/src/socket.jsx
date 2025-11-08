import { io } from "socket.io-client";

// ✅ Use environment variable for flexibility
const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

// ✅ Create a single shared socket instance
const socket = io(SOCKET_URL, {
  withCredentials: true, // allow cookies/auth headers if needed
  transports: ["websocket"], // use WebSocket for stability
  reconnection: true, // auto reconnect if disconnected
  reconnectionAttempts: 10, // retry up to 10 times
  reconnectionDelay: 1000, // 1s delay between retries
});

// ✅ Debug: Connection status logs
socket.on("connect", () => {
  console.log("🟢 Socket connected:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.warn("🔴 Socket disconnected:", reason);
});

socket.on("reconnect_attempt", (attempt) => {
  console.log(`🔁 Reconnecting... (Attempt ${attempt})`);
});

socket.on("reconnect", (attempt) => {
  console.log(`✅ Reconnected after ${attempt} attempt(s)`);
});

socket.on("connect_error", (err) => {
  console.error("⚠️ Socket connection error:", err.message);
});

export default socket;
