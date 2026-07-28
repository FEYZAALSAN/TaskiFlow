const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authenticateToken = require("../middleware/authMiddleware");

router.use(authenticateToken);

// GET /api/users/me
router.get("/me", userController.getMe);
router.put("/profile", userController.updateProfile);
router.put("/change-password", userController.changePassword);
router.delete("/account", userController.deleteAccount);

module.exports = router;