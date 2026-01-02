const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const integrationController = require("../controllers/integrationController");

// some require login, some not
router.get("/quote", integrationController.getDailyQuote);
router.get("/weather-suggestions", integrationController.getWeatherSuggestion);
router.get("/calendar", auth, integrationController.calendarIntegrationInfo);
router.post("/share", auth, integrationController.shareProgressStub);
router.get("/health", auth, integrationController.healthIntegrationInfo);

module.exports = router;