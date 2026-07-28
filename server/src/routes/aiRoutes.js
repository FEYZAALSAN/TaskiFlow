/**
 * AI routes geçici olarak kapatıldı.
 * Yedek: server/disabled/aiRoutes.js.bak
 * Açmak için yedeği geri yükle ve server.js içinde app.use("/api/ai", aiRoutes) ekle.
 */
const express = require("express");
const router = express.Router();
// const { getAIChatResponse } = require("../controllers/aiController");

// router.post("/chat", getAIChatResponse);

router.post("/chat", (req, res) => {
  res.status(503).json({ error: "AI geçici olarak kapalı." });
});

module.exports = router;
