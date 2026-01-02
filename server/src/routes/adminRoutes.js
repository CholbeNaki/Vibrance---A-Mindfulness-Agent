const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const requireAdmin = require("../middleware/requireAdmin");
const adminController = require("../controllers/adminController");

router.use(auth, requireAdmin);

router.post("/meditations", adminController.createMeditation);
router.put("/meditations/:id", adminController.updateMeditation);

router.post("/articles", adminController.createArticle);
router.put("/articles/:id", adminController.updateArticle);

router.get("/users", adminController.listUsers);
router.put("/users/:id/role", adminController.updateUserRole);

module.exports = router;