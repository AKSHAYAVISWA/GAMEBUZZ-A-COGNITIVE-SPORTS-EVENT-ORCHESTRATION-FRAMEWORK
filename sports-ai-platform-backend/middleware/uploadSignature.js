const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure signature upload directory exists
const signatureDir = "uploads/signatures";
if (!fs.existsSync(signatureDir)) {
  fs.mkdirSync(signatureDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, signatureDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const userId = req.user.id || req.user._id; // ✅ FIX
    cb(null, `${userId}_signature${ext}`);
  },
});

// File filter (PNG only)
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(new Error("Only PNG files are allowed"), false);
  }
};

const uploadSignature = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB (recommended)
  },
});

module.exports = uploadSignature;
