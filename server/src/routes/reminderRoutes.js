const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const reminderController = require("../controllers/reminderController");

router.get("/", auth, reminderController.getReminder);
router.post("/", auth, reminderController.setReminder);

module.exports = router;