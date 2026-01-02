const bcrypt = require("bcryptjs");
const User = require("../models/User");

// PUT /api/users/me
exports.updateProfile = async (req, res) => {
  try {
    const user = req.user;
    const {
      username,
      email,
      displayName,
      avatarUrl,
      password,
      newPassword,
      focusTags        // NEW: mental wellbeing focus tags
    } = req.body;

    // Username change
    if (username && username !== user.username) {
      const existingUsername = await User.findOne({
        username,
        _id: { $ne: user._id }
      });
      if (existingUsername) {
        return res.status(400).json({ message: "Username already in use" });
      }
      user.username = username;
    }

    // Email change
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({
        email,
        _id: { $ne: user._id }
      });
      if (existingEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = email;
    }

    // Display name + avatar url (string)
    if (displayName !== undefined) user.displayName = displayName;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

    // NEW: focus tags (array of strings)
    if (Array.isArray(focusTags)) {
      user.focusTags = focusTags;
    }

    // Password change (supports both old "password" and new "newPassword")
    const pwdToUse = newPassword || password;
    if (pwdToUse) {
      user.passwordHash = await bcrypt.hash(pwdToUse, 10);
    }

    await user.save();

    res.json({
      message: "Profile updated",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        focusTags: user.focusTags || []   // include tags in response
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Profile update failed" });
  }
};

// POST /api/users/me/avatar
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = req.user;
    const baseUrl = process.env.SERVER_PUBLIC_URL || "http://localhost:5000";
    const relativePath = `/uploads/avatars/${req.file.filename}`;

    user.avatarUrl = `${baseUrl}${relativePath}`;
    await user.save();

    res.json({ message: "Avatar updated", avatarUrl: user.avatarUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Avatar upload failed" });
  }
};
