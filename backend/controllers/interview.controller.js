const {
  startInterview,
  nextQuestion,
  submitAnswer,
  skipQuestion,
  getInterviewResult,
  getInterviewHistory,
  resumeInterview
} = require("../services/interview.service.js");
const Interview = require("../models/Interview.js");
const InterviewAnswer = require("../models/InterviewAnswer.js");
const InterviewSummary = require("../models/InterviewSummary.js");
const User = require("../models/User.js");
const { generateAISummary } = require("../services/aiSummary.service.js");
const asyncHandler = require("../utils/asyncHandler");
const logger = require("../utils/logger");
const { BadRequestError, ForbiddenError, NotFoundError } = require("../utils/errors");

const multer = require("multer");
const { PDFParse } = require("pdf-parse");
const upload = multer({ storage: multer.memoryStorage() });

const { uploadBufferToCloudinary } = require("../utils/cloudinary");
const { structureResume } = require("../services/ai.service");

exports.startInterviewController = [
  upload.single("resumeFile"),
  asyncHandler(async (req, res) => {
    const { role, topic, totalQuestions, resumeText, templateId, difficulty } = req.body;
    if (!role) {
      throw new BadRequestError("role is required");
    }

    const parsedQuestionCount = totalQuestions ? parseInt(totalQuestions, 10) : 10;
    if (Number.isNaN(parsedQuestionCount) || parsedQuestionCount <= 0) {
      throw new BadRequestError("totalQuestions must be a positive number");
    }

    let finalResumeContent = resumeText || null;
    let resumeUrl = null;
    let resumeData = null;

    if (req.file) {
      try {
        const parser = new PDFParse({ data: req.file.buffer });
        const data = await parser.getText();
        finalResumeContent = data.text;

        const cloudRes = await uploadBufferToCloudinary(req.file.buffer);
        resumeUrl = cloudRes.secure_url;
      } catch (err) {
        logger.error("Resume processing failed", {
          message: err.message,
          stack: err.stack,
          userId: String(req.user._id)
        });
      }
    }

    if (finalResumeContent) {
      resumeData = await structureResume(finalResumeContent);
    }

    const isCustomOrResume = !templateId;
    const requiredCredits = parsedQuestionCount * 10;

    // Check if user has an active ultimate plan
    const isPlanActive = req.user.planExpiresAt && new Date(req.user.planExpiresAt) > new Date();
    const isUltimate = req.user.plan === "ultimate" && isPlanActive;

    let creditsDeducted = false;

    if (isCustomOrResume && !isUltimate) {
      // Atomically check and deduct credits to prevent double-spending race conditions
      const updatedUser = await User.findOneAndUpdate(
        { _id: req.user._id, credits: { $gte: requiredCredits } },
        { $inc: { credits: -requiredCredits } },
        { new: true }
      );

      if (!updatedUser) {
        throw new ForbiddenError(`Not enough credits. You need ${requiredCredits} credits for a ${parsedQuestionCount}-question interview.`);
      }

      req.user.credits = updatedUser.credits;
      creditsDeducted = true;
    }

    let interview;
    try {
      interview = await startInterview({
        userId: req.user._id,
        role,
        topic: topic || "General",
        totalQuestions: parsedQuestionCount,
        resumeContent: finalResumeContent,
        resumeUrl,
        resumeData,
        templateId: templateId || null,
        difficulty: difficulty || "intermediate"
      });
    } catch (err) {
      // Rollback deducted credits if interview creation fails
      if (creditsDeducted) {
        await User.findByIdAndUpdate(req.user._id, { $inc: { credits: requiredCredits } });
      }
      throw err;
    }

    res.json({ interviewId: interview._id });
  })
];

exports.getInterviewHistoryController = asyncHandler(async (req, res) => {
  const interviews = await getInterviewHistory(req.user._id);
  res.json(interviews);
});

exports.nextQuestionController = asyncHandler(async (req, res) => {
  const { interviewId } = req.body;
  if (!interviewId) {
    throw new BadRequestError("interviewId is required");
  }

  const question = await nextQuestion(interviewId, req.user._id);
  res.json({ question });
});

exports.submitAnswerController = asyncHandler(async (req, res) => {
  const { interviewId, answer } = req.body;
  if (!interviewId || !answer) {
    throw new BadRequestError("interviewId and answer are required");
  }

  const evaluation = await submitAnswer(interviewId, req.user._id, answer);
  res.json(evaluation);
});

exports.skipQuestionController = asyncHandler(async (req, res) => {
  const { interviewId } = req.body;
  if (!interviewId) {
    throw new BadRequestError("interviewId is required");
  }

  const result = await skipQuestion(interviewId, req.user._id);
  res.json(result);
});

exports.userQuitController = asyncHandler(async (req, res) => {
  const { interviewId } = req.params;
  const interview = await Interview.findOne({ _id: interviewId, userId: req.user._id });

  if (!interview) {
    throw new NotFoundError("Interview not found");
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
});

exports.getInterviewResultController = asyncHandler(async (req, res) => {
  const result = await getInterviewResult(req.params.id, req.user._id);
  res.json(result);
});

exports.resumeInterviewController = asyncHandler(async (req, res) => {
  const resume = await resumeInterview(req.params.id, req.user._id);
  res.json(resume);
});

exports.generateInterviewSummaryController = asyncHandler(async (req, res) => {
  const { interviewId } = req.params;
  const userId = req.user._id;

  const interview = await Interview.findOne({ _id: interviewId, userId });
  if (!interview) {
    throw new NotFoundError("Interview not found");
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
    throw new BadRequestError("Interview is still in progress");
  }

  const answers = await InterviewAnswer.find({ interviewId });
  const interviewPayload = {
    totalQuestions: interview.totalQuestions,
    answers,
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

    logger.error("Interview summary error", {
      message: err.message,
      stack: err.stack,
      interviewId,
      userId: String(userId)
    });
    throw err;
  }
});

exports.getInterviewDetailController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const interview = await Interview.findOne({ _id: id, userId: req.user._id });
  if (!interview) {
    throw new NotFoundError("Interview not found");
  }

  const answers = await InterviewAnswer.find({ interviewId: id }).sort({ createdAt: 1 });
  const summary = await InterviewSummary.findOne({ interview: id });

  res.json({
    interview,
    answers,
    summary
  });
});
