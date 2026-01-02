const axios = require("axios");

// 17. Daily Mindful Quote
// GET /api/integrations/quote
exports.getDailyQuote = async (req, res) => {
  try {
    const { data } = await axios.get(process.env.QUOTE_API_URL);
    // Shape depends on provider; here assuming [{q: "...", a: "..."}]
    const quoteObj = Array.isArray(data) ? data[0] : data;
    res.json({
      quote: quoteObj.q || quoteObj.quote || "Be present.",
      author: quoteObj.a || quoteObj.author || "Unknown"
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ message: "Could not fetch quote" });
  }
};

// 18. Weather-Based Suggestions
// GET /api/integrations/weather-suggestions?lat=..&lon=..
exports.getWeatherSuggestion = async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon)
      return res.status(400).json({ message: "lat and lon required" });

    const url = `${process.env.WEATHER_API_URL}?latitude=${lat}&longitude=${lon}&hourly=rain`;
    const { data } = await axios.get(url);

    const isRainy =
      data.hourly && data.hourly.rain?.some((r) => r > 0.1);

    const suggestion = isRainy
      ? "It's rainy. Try a 'Rainy Day Calm' or indoor body scan meditation."
      : "Nice weather! Try a 'Mindful Walk' or outdoor breathing exercise.";

    res.json({ suggestion, weatherRaw: data });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ message: "Could not fetch weather suggestions" });
  }
};

// 19. Calendar Integration (Google/Outlook) - STUB for assignment
// For real use: OAuth flow, then list free time slots & create reminders.
exports.calendarIntegrationInfo = (req, res) => {
  res.json({
    message:
      "Calendar integration placeholder. In real implementation, connect with Google/Outlook OAuth and schedule reminders in free slots."
  });
};

// 20. Social Media Sharing - front-end usually uses share URLs.
// Backend stub for logging share actions.
exports.shareProgressStub = (req, res) => {
  const { platform, message } = req.body;
  res.json({
    message: `Pretend sharing to ${platform}: "${message}"`,
    note: "In real life, use client-side SDKs or share URLs."
  });
};

// 21. HealthKit / Google Fit Integration - STUB
exports.healthIntegrationInfo = (req, res) => {
  res.json({
    message:
      "HealthKit / Google Fit integration placeholder. Real implementation would sync meditation sessions as mindful minutes."
  });
};