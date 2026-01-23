const mongoose = require("mongoose");
const newSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    role: {
        type: String,
        required: true,
    },
    topic: {
        type: String,
        default: "General",
    },
    totalQuestions: {
        type: Number,
        default: 10,
    },
    status: {
        type: String,
        enum: ["in_progress", "quit", "Completed"],
        required: true,
        default: "in_progress"
    },
    endedReason: {
        type: String,
    },
    currentQuestionIndex: {
        type: Number,
        default: 0
    },
    totalScore: {
        type: Number,
        default: 0,
    },
    finalSummary: {
        averageScore: Number,
        strengths: [String],
        weaknesses: [String]
    },
    currentQuestion: {
        type: String,
        default: null
    },
    currentQuestionId: {
        type: String,
        default: null
    },
    summaryGenerated: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
});

const Interview = mongoose.model("Interview", newSchema);
module.exports = Interview;