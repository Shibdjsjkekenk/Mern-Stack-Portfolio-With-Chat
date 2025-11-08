const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 🔹 Allowed image types (supports webp, jpg, jpeg, png)
const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

// 🔹 Dynamic Upload Function — allows folder names like ("profiles"), ("documents"), etc.
const upload = (folderName = "uploads") => {
  // ✅ Ensure base uploads directory exists
  const baseUploadPath = path.join(__dirname, "../uploads");
  if (!fs.existsSync(baseUploadPath)) {
    fs.mkdirSync(baseUploadPath, { recursive: true });
  }

  // ✅ Ensure target folder exists (like uploads/profiles)
  const uploadPath = path.join(baseUploadPath, folderName);
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  // ✅ Storage Configuration
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueName =
        Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname);
      cb(null, uniqueName);
    },
  });

  // ✅ File Filter for validation
  const fileFilter = (req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(
        new Error("Only image files (JPG, JPEG, PNG, WEBP) are allowed."),
        false
      );
    }
    cb(null, true);
  };

  // ✅ Multer Instance with 30KB limit
  const uploader = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 30 * 1024, // 30KB limit
    },
  });

  // ✅ Middleware Wrapper (handles multer errors safely)
  return (req, res, next) => {
    const singleUpload = uploader.single("profilePic");

    singleUpload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // Multer-specific error
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message: "File too large. Maximum size allowed is 30 KB.",
          });
        }
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`,
        });
      } else if (err) {
        // Unknown or custom error
        return res.status(400).json({
          success: false,
          message: err.message || "Upload failed",
        });
      }

      // ✅ Attach full file URL (so frontend sees full path)
      if (req.file) {
        const baseUrl =
          process.env.BACKEND_URL || "http://localhost:8080";
        req.file.publicPath = `${baseUrl}/uploads/${folderName}/${req.file.filename}`;
      }

      next();
    });
  };
};

module.exports = upload;
