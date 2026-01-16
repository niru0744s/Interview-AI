const mongoose = require("mongoose");

const interviewAnswerSchema = new mongoose.Schema(
  {
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
      required: true
    },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    score: { type: Number, required: true },
    strengths: [{ type: String }],
    missing_points: [{ type: String }],
    ideal_answer: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("InterviewAnswer", interviewAnswerSchema);
