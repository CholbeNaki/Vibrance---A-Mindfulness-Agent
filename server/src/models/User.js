const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: false },
    time: { type: String, default: "20:00" }, // "HH:mm"
    type: {
      type: String,
      enum: ["meditation", "journal"],
      default: "meditation"
    }
  },
  { _id: false }
);;

const statsSchema = new mongoose.Schema({
  totalMeditationMinutes: { type: Number, default: 0 },
  totalSessions: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastMeditatedDate: { type: Date, default: null }
});

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    displayName: { type: String },
    avatarUrl: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Meditation" }],
    focusTags: {
      type: [String],
      default: []
    },
    reminder: reminderSchema,
    stats: statsSchema
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);