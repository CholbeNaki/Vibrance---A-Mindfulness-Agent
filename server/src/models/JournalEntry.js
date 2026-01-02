// server/src/models/JournalEntry.js
const mongoose = require("mongoose");

const journalEntrySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    mood: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    emotionLabel: {
      type: String,
      default: ""
    },
    title: {
      type: String,
      default: ""
    },
    text: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("JournalEntry", journalEntrySchema);
