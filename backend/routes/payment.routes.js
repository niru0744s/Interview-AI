const express = require("express");
const router = express.Router();
const { createOrderController, verifyPaymentController, cancelPlanController } = require("../controllers/payment.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

router.post("/create-order", requireAuth, createOrderController);
router.post("/verify", requireAuth, verifyPaymentController);
router.post("/cancel-plan", requireAuth, cancelPlanController);

module.exports = router;
