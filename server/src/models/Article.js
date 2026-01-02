const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: String },
    source: { type: String },        // e.g. "Mindful.org"
    url: { type: String },           // original article link

    // Summary / preview
    summary: { type: String },

    // Full content from RSS (HTML)
    contentHtml: { type: String },   // may be null if feed doesn't provide

    // Image from RSS, if available
    imageUrl: { type: String },

    // AI analysis fields
    sentimentLabel: { type: String },    // e.g. "POSITIVE"
    sentimentScore: { type: Number },    // 0–1
    topEmotions: [{ type: String }],     // e.g. ["joy", "gratitude"]
    positivityScore: { type: Number },   // convenience 0–1 for filtering

    tags: [String],
    publishedAt: { type: Date },
    published: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Article", articleSchema);
