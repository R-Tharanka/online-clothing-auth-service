const express = require("express");

const authController = require("../controllers/authController");
const { authenticate } = require("../middleware/authMiddleware");
const { requireRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refreshToken);
router.post("/logout", authController.logout);
router.post("/password-reset-request", authController.passwordResetRequest);
router.post("/password-reset", authController.passwordReset);

router.get("/me", authenticate, authController.getMe);
router.get("/users", authenticate, requireRoles("shop_owner"), authController.listUsers);
router.get("/users/:id", authenticate, requireRoles("shop_owner"), authController.getUserById);
router.post("/users/:id/roles", authenticate, requireRoles("shop_owner"), authController.addRole);
router.delete("/users/:id/roles", authenticate, requireRoles("shop_owner"), authController.removeRole);

module.exports = router;
