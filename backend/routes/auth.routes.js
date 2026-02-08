const express = require("express");
const router = express.Router();
const { register, login, logout, getMe, switchRole, verifyEmail, resendVerification, forgotPassword, resetPassword, deleteAccount } = require("../controllers/auth.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", requireAuth, getMe);
router.post("/switch-role", requireAuth, switchRole);
router.delete("/delete", requireAuth, deleteAccount);

module.exports = router;