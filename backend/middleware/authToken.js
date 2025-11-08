const jwt = require("jsonwebtoken");

async function authToken(req, res, next) {
  try {
    // ✅ Try reading token from cookies OR Authorization header
    const token =
      req.cookies?.token ||
      req.headers?.authorization?.split(" ")[1]; // support "Bearer <token>"

    console.log("🔑 Incoming token:", token ? "found ✅" : "missing ❌");

    // ✅ No token found
    if (!token) {
      return res.status(401).json({
        message: "Please login to continue.",
        error: true,
        success: false,
      });
    }

    // ✅ Verify JWT
    jwt.verify(token, process.env.TOKEN_SECRET_KEY, (err, decoded) => {
      if (err) {
        console.error("❌ JWT verification error:", err.message);
        return res.status(403).json({
          message: "Session expired or invalid token.",
          error: true,
          success: false,
        });
      }

      // ✅ Save user ID for next middleware
      req.userId = decoded?._id;
      req.userRole = decoded?.role || "USER"; // optional for admin checks

      // ✅ Continue request
      next();
    });
  } catch (err) {
    console.error("⚠️ Auth middleware error:", err.message);
    res.status(500).json({
      message: "Authentication failed.",
      error: true,
      success: false,
    });
  }
}

module.exports = authToken;
