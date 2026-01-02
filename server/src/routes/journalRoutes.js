const express = require("express");
const router = express.Router();

const journalController = require("../controllers/journalController");
const auth = require("../middleware/auth");

router.get("/", auth, journalController.getEntries);
router.post("/", auth, journalController.createEntry);
router.delete("/:id", auth, journalController.deleteEntry);

module.exports = router;
