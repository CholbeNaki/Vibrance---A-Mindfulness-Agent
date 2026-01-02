const mongoose = require("mongoose");

const meditationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,

    // Audio file URL
    audioUrl: { type: String, required: true },

    // image shown on cards / player
    imageUrl: {
      type: String,
      default: "" // you can leave empty for some meditations if needed
    },

    // mindfulness coach / author name
    coachName: {
      type: String,
      default: "Vibrance Team"
    },

    category: {
      type: String,
      enum: ["Sleep", "Anxiety", "Focus", "Beginners", "Other"],
      default: "Other"
    },

    durationMinutes: { type: Number, required: true },

    // tags shown as pills on the card
    tags: {
      type: [String],
      default: []
    },

    isPublic: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Meditation", meditationSchema);
