const Article = require("../models/Article");

// GET /api/articles
// Return only published, highly positive articles
exports.listArticles = async (req, res) => {
  try {
    const minPositivity = Number(req.query.minPositivity || 0.85);

    const articles = await Article.find({
      published: true,
      positivityScore: { $gte: minPositivity }
    })
      .sort({ positivityScore: -1, publishedAt: -1 })
      .limit(50);

    res.json({ articles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not load articles" });
  }
};
