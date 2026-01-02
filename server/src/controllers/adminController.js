const Meditation = require("../models/Meditation");
const Article = require("../models/Article");
const User = require("../models/User");

// Meditation content
// POST /api/admin/meditations
exports.createMeditation = async (req, res) => {
  try {
    const meditation = await Meditation.create(req.body);
    res.status(201).json({ meditation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not create meditation" });
  }
};

// PUT /api/admin/meditations/:id
exports.updateMeditation = async (req, res) => {
  try {
    const meditation = await Meditation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json({ meditation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not update meditation" });
  }
};

// Articles
// POST /api/admin/articles
exports.createArticle = async (req, res) => {
  try {
    const article = await Article.create(req.body);
    res.status(201).json({ article });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not create article" });
  }
};

// PUT /api/admin/articles/:id
exports.updateArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });
    res.json({ article });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not update article" });
  }
};

// User management
// GET /api/admin/users
exports.listUsers = async (req, res) => {
  try {
    const users = await User.find().select("-passwordHash");
    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not load users" });
  }
};

// PUT /api/admin/users/:id/role
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-passwordHash");
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not update user role" });
  }
};