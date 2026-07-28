/**
 * Chat/AI routes geçici olarak kapatıldı.
 * Yedek: server/disabled/chatRoutes.js.bak
 */
const express = require("express");
const router = express.Router();
// const chatController = require("../controllers/chatController");
// const authenticateToken = require("../middleware/authMiddleware");

// router.use(authenticateToken);
// router.post("/", chatController.chat);

router.post("/", (req, res) => {
  res.status(503).json({ error: "AI geçici olarak kapalı." });
});

module.exports = router;
