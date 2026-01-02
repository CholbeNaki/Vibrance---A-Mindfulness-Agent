const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const userController = require("../controllers/userController");

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure avatars directory exists
const avatarsDir = path.join(__dirname, "..", "..", "uploads", "avatars");
fs.mkdirSync(avatarsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, avatarsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `${req.user._id}-${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  }
});

// Update main profile fields
router.put("/me", auth, userController.updateProfile);

// Upload avatar image
router.post(
  "/me/avatar",
  auth,
  upload.single("avatar"),
  userController.uploadAvatar
);

module.exports = router;
