// server/src/models/MeditationSession.js
const mongoose = require("mongoose");

const meditationSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    durationMinutes: {
      type: Number,
      required: true
    },
    source: {
      type: String,
      enum: ["guided", "unguided"],
      default: "guided"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("MeditationSession", meditationSessionSchema);
