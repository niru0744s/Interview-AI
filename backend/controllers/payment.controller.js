const { getRazorpayInstance } = require("../services/payment.service");
const crypto = require("crypto");
const User = require("../models/User");
const Payment = require("../models/Payment");

const PLAN_PRICES = {
    standard: 200, // 200 INR
    advance: 500,  // 500 INR
    ultimate: 1000 // 1000 INR
};

const PLAN_CREDITS = {
    standard: 1000,
    advance: 3000,
    ultimate: 999999 // Representing unlimited
};

exports.createOrderController = async (req, res) => {
    try {
        const { planId } = req.body; // "standard", "advance", "ultimate"

        if (!PLAN_PRICES[planId]) {
            return res.status(400).json({ error: "Invalid plan ID" });
        }

        const amount = PLAN_PRICES[planId] * 100; // in paise

        const razorpay = getRazorpayInstance();

        const options = {
            amount: amount,
            currency: "INR",
            receipt: `receipt_order_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);

        if (!order) {
            return res.status(500).json({ error: "Failed to create order" });
        }

        // Store order in Payment collection for tracking and verification
        await Payment.create({
            userId: req.user._id,
            orderId: order.id,
            planId,
            amount: PLAN_PRICES[planId],
            currency: "INR",
            status: "created"
        });

        res.json({
            orderId: order.id,
            amount: amount,
            currency: "INR"
        });
    } catch (err) {
        console.error("Order creation error:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.verifyPaymentController = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        const userId = req.user._id;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ error: "Missing required payment details" });
        }

        // Find the order record
        const paymentRecord = await Payment.findOne({ orderId: razorpay_order_id, userId });
        if (!paymentRecord) {
            return res.status(404).json({ error: "Order not found" });
        }

        // Prevent replay attacks
        if (paymentRecord.status === "paid") {
            return res.status(400).json({ error: "Payment has already been verified and processed" });
        }

        // Use verified planId from database rather than trusting client request body
        const verifiedPlanId = paymentRecord.planId;
        if (!PLAN_PRICES[verifiedPlanId]) {
            return res.status(400).json({ error: "Invalid plan ID on record" });
        }

        const secret = process.env.RAZORPAY_KEY_SECRET || "mock_key_secret";

        // Setup signature verification string
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", secret)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature !== expectedSign) {
            paymentRecord.status = "failed";
            await paymentRecord.save();
            return res.status(400).json({ error: "Invalid payment signature" });
        }

        // Mark payment as paid before allocating credits
        paymentRecord.paymentId = razorpay_payment_id;
        paymentRecord.status = "paid";
        await paymentRecord.save();

        // Signature is valid. Update user's plan and credits.
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        user.plan = verifiedPlanId;
        user.credits = verifiedPlanId === 'ultimate' ? PLAN_CREDITS.ultimate : (user.credits || 0) + PLAN_CREDITS[verifiedPlanId];
        user.planExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

        await user.save();

        res.json({
            message: "Payment verified successfully",
            plan: user.plan,
            credits: user.credits,
            planExpiresAt: user.planExpiresAt
        });

    } catch (err) {
        console.error("Payment verification error:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.cancelPlanController = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (user.plan === 'free') {
            return res.status(400).json({ error: "You do not have an active premium plan to cancel." });
        }

        // If canceling ultimate tier, reset synthetic unlimited credits back to free baseline
        if (user.plan === 'ultimate') {
            user.credits = 500;
        }

        user.plan = 'free';
        // Reset the expiration date since they no longer have a premium plan
        user.planExpiresAt = null;

        await user.save();

        res.json({
            message: "Plan cancelled successfully. You have been downgraded to the free tier, but your existing credits remain active.",
            plan: user.plan,
            credits: user.credits
        });

    } catch (err) {
        console.error("Plan cancellation error:", err);
        res.status(500).json({ error: err.message });
    }
};
