const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        orderId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        paymentId: {
            type: String,
            unique: true,
            sparse: true
        },
        planId: {
            type: String,
            enum: ["standard", "advance", "ultimate"],
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        currency: {
            type: String,
            default: "INR"
        },
        status: {
            type: String,
            enum: ["created", "paid", "failed"],
            default: "created",
            index: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Payment", paymentSchema);
