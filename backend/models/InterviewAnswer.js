const mongoose = require("mongoose");

const interviewAnswerSchema = new mongoose.Schema(
  {
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
      required: true
    },
    questionIndex: { type: Number, default: 0 },
    question: { type: String, required: true },
    questionType: {
      type: String,
      enum: ["conceptual", "mcq", "multi_choice", "code"],
      default: "conceptual"
    },
    answer: { type: String },
    selectedOptions: { type: [String], default: [] },
    codeAnswer: {
      code: { type: String, default: null },
      language: { type: String, default: null }
    },
    score: { type: Number, default: 0 },
    isSkipped: { type: Boolean, default: false },
    strengths: [{ type: String }],
    missing_points: [{ type: String }],
    ideal_answer: { type: String }
  },
  { timestamps: true }
);

interviewAnswerSchema.index({ interviewId: 1, createdAt: 1 });
interviewAnswerSchema.index({ interviewId: 1, questionIndex: 1 });

module.exports = mongoose.model("InterviewAnswer", interviewAnswerSchema);
