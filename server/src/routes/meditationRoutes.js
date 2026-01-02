// server/routes/meditationRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const meditationController = require("../controllers/meditationController");

// list
router.get("/", meditationController.listMeditations);
router.post("/", auth, meditationController.createMeditation);

router.post(
  "/:id/feedback",
  auth,
  meditationController.addFeedback
);
router.get(
  "/:id/feedback/me/latest",
  auth,
  meditationController.getLatestFeedbackForUser
);

router.get("/:id", meditationController.getMeditation);
router.post("/:id/favorite", auth, meditationController.toggleFavorite);
router.get("/favorites/list", auth, meditationController.getFavorites);

module.exports = router;
