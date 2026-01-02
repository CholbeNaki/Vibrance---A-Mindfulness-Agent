// server/src/controllers/journalController.js
const JournalEntry = require("../models/JournalEntry");

// GET /api/journal
exports.getEntries = async (req, res) => {
  try {
    const entries = await JournalEntry.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ entries });
  } catch (err) {
    console.error("getEntries error", err);
    res.status(500).json({ message: "Failed to load journal entries" });
  }
};

// POST /api/journal
exports.createEntry = async (req, res) => {
  try {
    const { mood, emotionLabel, title, text } = req.body;
    const m = Number(mood) || 1;

    const entry = await JournalEntry.create({
      user: req.user._id,
      mood: Math.min(5, Math.max(1, m)),
      emotionLabel: emotionLabel || "",
      title: title || "",
      text: text || ""
    });

    res.status(201).json({ entry });
  } catch (err) {
    console.error("createEntry error", err);
    res.status(500).json({ message: "Failed to create journal entry" });
  }
};

// DELETE /api/journal/:id
exports.deleteEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await JournalEntry.findOneAndDelete({
      _id: id,
      user: req.user._id
    });

    if (!deleted) {
      return res.status(404).json({ message: "Entry not found" });
    }

    res.json({ message: "Entry deleted" });
  } catch (err) {
    console.error("deleteEntry error", err);
    res.status(500).json({ message: "Failed to delete journal entry" });
  }
};
