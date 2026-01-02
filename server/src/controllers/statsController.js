// server/src/controllers/statsController.js
const MeditationSession = require("../models/MeditationSession");

// POST /api/stats/session
exports.recordSession = async (req, res) => {
  try {
    const { durationMinutes, source } = req.body;

    const minutes = Math.max(1, Math.round(Number(durationMinutes) || 0));

    const session = await MeditationSession.create({
      user: req.user._id,
      durationMinutes: minutes,
      source: source || "guided"
    });

    res.json({
      message: "Session recorded",
      session
    });
  } catch (err) {
    console.error("Failed to record session:", err);
    res.status(500).json({ message: "Failed to record session" });
  }
};
