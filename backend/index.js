const express = require("express");
const cors = require("cors");
const http = require("http");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");
const router = require("./routes");
const chatAuthRoutes = require("./routes/chatAuthRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();
const server = http.createServer(app);

// Import Socket from controller
const { initSocket } = require("./controller/socket/initSocket");

// =====================================================
// ✅ STABLE & SAFE CORS CONFIG (no path-to-regexp bug)
// =====================================================
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// =====================================================
// Middleware
// =====================================================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Serve all uploaded images (including nested folders like /profiles)
app.use("/uploads", express.static(path.resolve(__dirname, "uploads")));

// =====================================================
// Routes
// =====================================================
app.use("/api", router);
app.use("/api/auth", chatAuthRoutes);
app.use("/api/chat", chatRoutes);

// =====================================================
// Initialize Socket
// =====================================================
initSocket(server);

// =====================================================
// Start Server + DB
// =====================================================
const PORT = process.env.PORT || 8080;
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log("✅ MongoDB Connected");
      console.log("🚀 Server running on port " + PORT);
      console.log("📂 Serving uploads from:", path.resolve(__dirname, "uploads"));
      console.log("🌍 Allowed Origin:", process.env.FRONTEND_URL || "http://localhost:5173");
    });
  })
  .catch((err) => console.error("❌ DB connection failed:", err));
