// server/src/routes/statsRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const statsController = require("../controllers/statsController");

// record a meditation session (used by the player and unguided timer)
router.post("/session", auth, statsController.recordSession);

module.exports = router;
