// server/src/models/MeditationFeedback.js
const mongoose = require("mongoose");

const meditationFeedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    meditation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meditation",
      required: true
    },
    // 1 = Not really, 2 = Somewhat, 3 = Very helpful
    rating: {
      type: Number,
      min: 1,
      max: 3,
      required: true
    },
    note: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

// helpful for querying later
meditationFeedbackSchema.index(
  { user: 1, meditation: 1, createdAt: -1 },
  { name: "user_meditation_recent_feedback" }
);

module.exports = mongoose.model(
  "MeditationFeedback",
  meditationFeedbackSchema
);
