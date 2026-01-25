const { startInterview, nextQuestion, submitAnswer, skipQuestion, getInterviewResult, resumeInterview } = require("../services/interview.service.js");
const Interview = require("../models/Interview.js");
const InterviewAnswer = require("../models/InterviewAnswer.js");
const InterviewSummary = require("../models/InterviewSummary.js");
const { generateAISummary } = require("../services/aiSummary.service.js");

const multer = require("multer");
const pdf = require("pdf-parse");
const upload = multer({ storage: multer.memoryStorage() });

exports.startInterviewController = [
  upload.single("resumeFile"),
  async (req, res) => {
    try {
      const { role, topic, totalQuestions, resumeText, templateId, difficulty } = req.body;
      let finalResumeContent = resumeText || null;

      // ... (middle code handled by contiguous edit)

      const userId = req.user._id;
      const interview = await startInterview({
        userId,
        role,
        topic: topic || "General",
        totalQuestions: totalQuestions ? parseInt(totalQuestions) : 10,
        resumeContent: finalResumeContent,
        templateId: templateId || null,
        difficulty: difficulty || "intermediate"
      });
      res.json({ interviewId: interview._id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
];

exports.nextQuestionController = async (req, res) => {
  try {
    const { interviewId } = req.body;
    if (!interviewId) {
      return res.status(400).json({ error: "interviewId is required" });
    }
    const question = await nextQuestion(interviewId);
    res.json({ question });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.submitAnswerController = async (req, res) => {
  try {
    const { interviewId, answer } = req.body;
    if (!interviewId || !answer) {
      return res
        .status(400)
        .json({ error: "interviewId and answer are required" });
    }

    // Evaluation call updated to match service signature
    const evaluation = await submitAnswer(interviewId, answer);
    res.json(evaluation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.skipQuestionController = async (req, res) => {
  try {
    const { interviewId } = req.body;
    if (!interviewId) {
      return res.status(400).json({ error: "interviewId is required" });
    }
    const result = await skipQuestion(interviewId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.userQuitController = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const userId = req.user._id;

    const interview = await Interview.findOne({
      _id: interviewId,
      userId: userId
    });

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    if (interview.status === "quit" || interview.status === "Completed") {
      return res.status(200).json({
        message: "Interview already finalized",
        status: interview.status
      });
    }

    interview.status = "quit";
    interview.endedReason = "user_terminated";
    interview.endedAt = new Date();

    await interview.save();

    return res.status(200).json({
      message: "Interview quit successfully",
      interviewId,
      status: interview.status
    });

  } catch (error) {
    return res.status(500).json({
      message: "Failed to quit interview",
      error: error.message
    });
  }
};

exports.getInterviewResultController = async (req, res) => {
  try {
    const result = await getInterviewResult(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

exports.resumeInterviewController = async (req, res) => {
  try {
    const resume = await resumeInterview(req.params.id);
    res.json(resume);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

exports.generateInterviewSummaryController = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const userId = req.user._id;

    const interview = await Interview.findOne({
      _id: interviewId,
      userId: userId
    });

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    const existingSummary = await InterviewSummary.findOne({ interview: interviewId });
    if (existingSummary) {
      return res.status(200).json({
        message: "Summary already generated",
        summary: existingSummary,
        interview
      });
    }

    if (interview.status === "in_progress") {
      return res.status(400).json({
        message: "Interview is still in progress"
      });
    }

    // Fetch answers accurately from the dedicated collection
    const answers = await InterviewAnswer.find({ interviewId });

    const interviewPayload = {
      totalQuestions: interview.totalQuestions,
      answers: answers,
      status: interview.status,
      quitReason: interview.endedReason || null,
      startedAt: interview.createdAt,
      endedAt: interview.updatedAt
    };

    const aiResult = await generateAISummary(interviewPayload);

    try {
      const summaryDoc = await InterviewSummary.create({
        interview: interviewId,
        user: userId,
        score: aiResult.score,
        strengths: aiResult.strengths,
        weaknesses: aiResult.weaknesses,
        verdict: aiResult.verdict,
        feedback: aiResult.feedback
      });

      interview.summaryGenerated = true;
      interview.finalizedAt = new Date();
      await interview.save();

      return res.status(201).json({
        message: "Interview summary generated",
        summary: summaryDoc,
        interview
      });
    } catch (err) {
      // Handle race condition: If two requests hit simultaneously, one might fail with duplicate key error E11000
      if (err.code === 11000) {
        const existing = await InterviewSummary.findOne({ interview: interviewId });
        if (existing) {
          return res.status(200).json({
            message: "Summary already exists (concurrency handled)",
            summary: existing,
            interview
          });
        }
      }
      throw err; // Rethrow if it's not a duplicate key error
    }

  } catch (err) {
    console.error("Interview summary error:", err);
    return res.status(500).json({
      message: err.message || "Failed to generate interview summary"
    });
  }
};

exports.getInterviewDetailController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const interview = await Interview.findOne({ _id: id, userId });
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    const answers = await InterviewAnswer.find({ interviewId: id }).sort({ createdAt: 1 });
    const summary = await InterviewSummary.findOne({ interview: id });

    res.json({
      interview,
      answers,
      summary
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
