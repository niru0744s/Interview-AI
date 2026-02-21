const mongoose = require("mongoose");
const newSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    templateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "JobTemplate",
        default: null
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
    difficulty: {
        type: String,
        enum: ["beginner", "intermediate", "professional"],
        default: "intermediate"
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
    },
    resumeContent: {
        type: String,
        default: null
    },
    resumeUrl: {
        type: String,
        default: null
    },
    resumeData: {
        type: Object,
        default: null
    }
}, {
    timestamps: true,
});

const Interview = mongoose.model("Interview", newSchema);
module.exports = Interview;