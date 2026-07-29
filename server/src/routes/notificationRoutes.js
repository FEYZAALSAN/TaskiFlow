const express = require("express");
const router = express.Router();
const notificController = require("../controllers/notificationController");
const authenticateToken = require("../middleware/authMiddleware");

router.use(authenticateToken);

router.get("/", notificController.getNotifications);
router.get("/unread-count", notificController.getUnreadCount);
router.patch("/read-all", notificController.markAllAsRead);
router.patch("/:id/read-status", notificController.updateReadStatus);
router.post("/respond-invite", notificController.respondToInvıte);
router.patch("/:id/read", notificController.markAsRead);

module.exports = router;