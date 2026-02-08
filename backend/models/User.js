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

// Middleware to delete all user-related data when user is deleted
// Middleware to delete all user-related data when user is deleted
newSchema.pre("findOneAndDelete", async function () {
    try {
        const user = await this.model.findOne(this.getQuery());
        if (!user) return; // If no user found, nothing to do

        const Interview = require("./Interview");
        const InterviewAnswer = require("./InterviewAnswer");
        const InterviewSummary = require("./InterviewSummary");
        const JobTemplate = require("./JobTemplate");

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

    } catch (err) {
        console.error("Error in pre-delete hook:", err);
        // We throw so Mongoose catches it and aborts the delete if needed, 
        // or at least logs it properly. 
        // However, throwing here might block the user deletion if we aren't careful. 
        // But preventing user deletion when cleanup fails is probably safer than leaving orphan data.
        throw err;
    }
});

const User = mongoose.model("User", newSchema);
module.exports = User;