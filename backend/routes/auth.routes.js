const express = require("express");
const router = express.Router();
const { register, login, logout, getMe, switchRole } = require("../controllers/auth.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", requireAuth, getMe);
router.post("/switch-role", requireAuth, switchRole);

module.exports = router;