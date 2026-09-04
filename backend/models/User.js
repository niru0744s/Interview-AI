const mongoose = require("mongoose");
const newSchema = mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["candidate", "recruiter"],
        default: "candidate"
    },
    plan: {
        type: String,
        enum: ["free", "standard", "advance", "ultimate"],
        default: "free"
    },
    credits: {
        type: Number,
        default: 500
    },
    planExpiresAt: {
        type: Date,
        default: null
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date
}, {
    timestamps: true
});

async function deleteAssociatedUserData(user) {
    try {
        if (!user) return;

        const Interview = require("./Interview");
        const InterviewAnswer = require("./InterviewAnswer");
        const InterviewSummary = require("./InterviewSummary");
        const JobTemplate = require("./JobTemplate");
        const Payment = require("./Payment");

        // 1. Find all interviews by this user
        const userInterviews = await Interview.find({ userId: user._id });
        const interviewIds = userInterviews.map(i => i._id);

        // 2. Delete all answers related to these interviews
        if (interviewIds.length > 0) {
            await InterviewAnswer.deleteMany({ interviewId: { $in: interviewIds } });
        }

        // 3. Delete all summaries related to these interviews (or by this user directly)
        await InterviewSummary.deleteMany({ user: user._id });

        // 4. Delete all interviews
        await Interview.deleteMany({ userId: user._id });

        // 5. Delete all job templates created by this recruiter
        await JobTemplate.deleteMany({ recruiterId: user._id });

        // 6. Delete all payment transactions
        await Payment.deleteMany({ userId: user._id });

    } catch (err) {
        console.error("Error in pre-delete hook:", err);
        throw err;
    }
}

newSchema.pre("findOneAndDelete", async function () {
    const user = await this.model.findOne(this.getQuery());
    await deleteAssociatedUserData(user);
});

newSchema.pre("deleteOne", { document: true, query: false }, async function () {
    await deleteAssociatedUserData(this);
});

const User = mongoose.model("User", newSchema);
module.exports = User;
