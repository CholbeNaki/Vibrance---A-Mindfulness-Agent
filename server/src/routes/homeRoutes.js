// server/src/routes/homeRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const homeController = require("../controllers/homeController");

// GET /api/home/summary
router.get("/summary", auth, homeController.getSummary);

module.exports = router;
