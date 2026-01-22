// backend/models/InterviewSummary.model.js

const mongoose = require("mongoose");

const interviewSummarySchema = new mongoose.Schema(
  {
    interview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
      required: true,
      unique: true
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },

    strengths: {
      type: [String],
      default: []
    },

    weaknesses: {
      type: [String],
      default: []
    },

    verdict: {
      type: String,
      enum: ["hire", "borderline", "reject"],
      required: true
    },

    feedback: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("InterviewSummary", interviewSummarySchema);