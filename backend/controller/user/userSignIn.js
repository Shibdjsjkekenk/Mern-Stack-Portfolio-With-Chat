const bcrypt = require("bcryptjs");
const userModel = require("../../models/userModel");
const jwt = require("jsonwebtoken");
const os = require("os");
const axios = require("axios");
const { io } = require("../socket/initSocket"); // ✅ socket instance import

async function userSignInController(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) throw new Error("Email & Password required");

    const user = await userModel.findOne({ email });
    if (!user) throw new Error("User not found");

    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) throw new Error("Incorrect password");

    const deviceName = os.hostname();

    // get IP address (handle proxies)
    let ipAddress =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress || "Unknown";

    // normalize IPv4 if present
    if (typeof ipAddress === "string" && ipAddress.includes("::ffff:")) {
      ipAddress = ipAddress.split("::ffff:").pop();
    }

    // detect local IP
    const isLocal =
      ipAddress === "::1" ||
      ipAddress === "127.0.0.1" ||
      ipAddress === "Unknown";

    if (!Array.isArray(user.logins)) user.logins = [];

    // default location values
    let city = "Unknown",
      state = "Unknown",
      country = "Unknown",
      latitude = null,
      longitude = null;

    if (!isLocal) {
      try {
        const geoRes = await axios.get(
          `http://ip-api.com/json/${ipAddress}?fields=status,message,country,regionName,city,lat,lon,query`
        );
        const geo = geoRes.data;

        if (geo && geo.status === "success") {
          city = geo.city || "Unknown";
          state = geo.regionName || "Unknown";
          country = geo.country || "Unknown";
          latitude = geo.lat || null;
          longitude = geo.lon || null;
        }

        // fallback: OpenStreetMap geocoding if lat/lon not available
        if ((latitude === null || longitude === null) && city !== "Unknown") {
          const osmRes = await axios.get(
            "https://nominatim.openstreetmap.org/search",
            {
              params: { format: "json", q: `${city}, ${state}, ${country}` },
            }
          );
          if (osmRes.data.length > 0) {
            latitude = parseFloat(osmRes.data[0].lat);
            longitude = parseFloat(osmRes.data[0].lon);
          }
        }
      } catch (geoErr) {
        console.error("Geo lookup error:", geoErr.message || geoErr);
      }
    } else {
      // local fallback (Mumbai coordinates)
      city = "Local";
      state = "Local";
      country = "Local";
      latitude = 19.076;
      longitude = 72.8777;
    }

    // increment login count
    user.loginCount = (user.loginCount || 0) + 1;

    // push login record
    user.logins.push({
      deviceName,
      ipAddress,
      city,
      state,
      country,
      latitude,
      longitude,
      loggedInAt: new Date(),
    });

    // ✅ Mark admin online (presence update)
    user.isOnline = true;
    await user.save();

    // ✅ Send real-time status to all ChatUsers
    if (io()) {
      io().emit("admin_status", {
        adminId: user._id.toString(),
        isOnline: true,
      });
      console.log("📢 Admin online broadcasted via socket");
    }

    // ✅ Create JWT
    const tokenData = { _id: user._id, email: user.email, role: user.role };
    const token = jwt.sign(tokenData, process.env.TOKEN_SECRET_KEY, {
      expiresIn: "7d",
    });

    // ✅ Send cookie with proper cross-origin config
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // ✅ for HTTPS on Render
        sameSite: "None", // ✅ required for cross-domain (frontend ↔ backend)
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .status(200)
      .json({
        success: true,
        message: "Login successful",
        data: {
          token,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            loginCount: user.loginCount,
            logins: user.logins,
            isOnline: true,
          },
        },
        error: false,
      });
  } catch (err) {
    console.error("Signin error:", err);
    res
      .status(400)
      .json({ message: err.message || err, error: true, success: false });
  }
}

module.exports = userSignInController;
