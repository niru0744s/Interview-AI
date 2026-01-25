const mongoose = require("mongoose");

const interviewAnswerSchema = new mongoose.Schema(
  {
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
      required: true
    },
    question: { type: String, required: true },
    answer: { type: String },
    score: { type: Number, default: 0 },
    isSkipped: { type: Boolean, default: false },
    strengths: [{ type: String }],
    missing_points: [{ type: String }],
    ideal_answer: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("InterviewAnswer", interviewAnswerSchema);
