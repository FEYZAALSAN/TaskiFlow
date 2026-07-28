const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const authenticateToken = require("../middleware/authMiddleware");

router.use(authenticateToken);
router.post("/", chatController.chat);

module.exports = router;