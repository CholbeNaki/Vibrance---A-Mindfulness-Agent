// server/controllers/meditationController.js
const Meditation = require("../models/Meditation");
const User = require("../models/User");
const MeditationFeedback = require("../models/MeditationFeedback");

// POST /api/meditations
exports.createMeditation = async (req, res) => {
  try {
    const {
      title,
      description,
      audioUrl,
      imageUrl,
      coachName,
      category,
      durationMinutes,
      tags
    } = req.body;

    // Basic validation
    if (!title || !audioUrl || !durationMinutes) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newMeditation = await Meditation.create({
      title,
      description,
      audioUrl,
      imageUrl,
      coachName,
      category,
      durationMinutes,
      tags: Array.isArray(tags) ? tags : []
    });

    res.status(201).json({ meditation: newMeditation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create meditation" });
  }
};

// GET /api/meditations?category=Sleep&minDuration=5&maxDuration=20
exports.listMeditations = async (req, res) => {
  try {
    const { category, minDuration, maxDuration } = req.query;
    const filter = { isPublic: true };

    if (category) filter.category = category;
    if (minDuration || maxDuration) {
      filter.durationMinutes = {};
      if (minDuration)
        filter.durationMinutes.$gte = Number(minDuration);
      if (maxDuration)
        filter.durationMinutes.$lte = Number(maxDuration);
    }

    const meditations = await Meditation.find(filter).sort({
      createdAt: -1
    });
    res.json({ meditations });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to load meditations" });
  }
};

// GET /api/meditations/:id
exports.getMeditation = async (req, res) => {
  try {
    const meditation = await Meditation.findById(
      req.params.id
    );
    if (!meditation)
      return res.status(404).json({ message: "Not found" });
    res.json({ meditation });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to load meditation" });
  }
};

// POST /api/meditations/:id/favorite
exports.toggleFavorite = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    const index = user.favorites.findIndex(
      (favId) => favId.toString() === id
    );
    if (index >= 0) {
      user.favorites.splice(index, 1);
      await user.save();
      return res.json({ message: "Removed from favorites" });
    } else {
      user.favorites.push(id);
      await user.save();
      return res.json({ message: "Added to favorites" });
    }
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Could not update favorites" });
  }
};

// GET /api/meditations/favorites/list
exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(
      req.user._id
    ).populate("favorites");
    res.json({ favorites: user.favorites });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to load favorites" });
  }
};

// POST /api/meditations/:id/feedback
exports.addFeedback = async (req, res) => {
  try {
    const userId = req.user._id;
    const meditationId = req.params.id;
    const { rating, note } = req.body;

    const numericRating = Number(rating);

    if (!numericRating || numericRating < 1 || numericRating > 3) {
      return res
        .status(400)
        .json({ message: "Rating must be 1, 2, or 3" });
    }

    const feedback = await MeditationFeedback.create({
      user: userId,
      meditation: meditationId,
      rating: numericRating,
      note: note || ""
    });

    res.json({ message: "Feedback saved", feedback });
  } catch (err) {
    console.error("Failed to save feedback", err);
    res
      .status(500)
      .json({ message: "Failed to save feedback" });
  }
};

// GET /api/meditations/:id/feedback/me/latest
exports.getLatestFeedbackForUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const meditationId = req.params.id;

    const feedback = await MeditationFeedback.findOne({
      user: userId,
      meditation: meditationId
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ feedback: feedback || null });
  } catch (err) {
    console.error("Failed to load feedback", err);
    res
      .status(500)
      .json({ message: "Failed to load feedback" });
  }
};
