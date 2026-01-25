const mongoose = require("mongoose");

const jobTemplateSchema = new mongoose.Schema({
    recruiterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        required: true
    },
    topic: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    totalQuestions: {
        type: Number,
        default: 10
    },
    difficulty: {
        type: String,
        enum: ["beginner", "intermediate", "professional"],
        default: "intermediate"
    },
    inviteCode: {
        type: String,
        unique: true,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("JobTemplate", jobTemplateSchema);
