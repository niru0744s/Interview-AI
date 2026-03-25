const fs = require("fs");
const { generateQuestion, evaluateAnswer } = require("./ai.service.js");
const Interview = require("../models/Interview.js");
const InterviewAnswer = require("../models/InterviewAnswer.js");
const logger = require("../utils/logger");
const {
  BadRequestError,
  ConflictError,
  NotFoundError,
} = require("../utils/errors");

const COMPLETED_STATUS = "completed";

const isCompleted = (status = "") => status.toLowerCase() === COMPLETED_STATUS;

const getOwnedInterview = async (interviewId, userId) => {
  const interview = await Interview.findOne({ _id: interviewId, userId });
  if (!interview) {
    throw new NotFoundError("Interview Not Found");
  }

  return interview;
};

exports.startInterview = async ({ userId, role, topic, totalQuestions, resumeContent, resumeUrl, resumeData, templateId, difficulty }) => {
  return Interview.create({
    userId,
    role,
    topic: topic || "General",
    totalQuestions: totalQuestions || 10,
    resumeContent: resumeContent || null,
    resumeUrl: resumeUrl || null,
    resumeData: resumeData || null,
    templateId: templateId || null,
    difficulty: difficulty || "intermediate"
  });
};

exports.nextQuestion = async (interviewId, userId) => {
  const interview = await getOwnedInterview(interviewId, userId);

  if (isCompleted(interview.status)) {
    return null;
  }

  if (interview.currentQuestion) {
    return {
      questionId: interview.currentQuestionId || `q_${Date.now()}`,
      question: interview.currentQuestion,
      currentIndex: interview.currentQuestionIndex + 1,
      totalQuestions: interview.totalQuestions
    };
  }

  const asked = await InterviewAnswer.find({ interviewId }).select("question score").lean();

  const difficultyMap = {
    beginner: "easy",
    intermediate: "medium",
    professional: "hard"
  };

  let difficulty = difficultyMap[interview.difficulty] || "medium";

  if (interview.currentQuestionIndex > 0 && asked.length > 0) {
    const totalScore = asked.reduce((sum, ans) => sum + (ans.score || 0), 0);
    const avgScore = totalScore / asked.length;

    if (avgScore > 8) difficulty = "hard";
    else if (avgScore < 5) difficulty = "easy";
  }

  const question = await generateQuestion({
    role: interview.role,
    topic: interview.topic,
    difficulty,
    askedQuestions: asked.map((item) => item.question),
    resumeContent: interview.resumeContent,
    resumeData: interview.resumeData
  });

  const updatedInterview = await Interview.findOneAndUpdate(
    {
      _id: interviewId,
      userId,
      currentQuestion: null,
      status: { $in: ["in_progress", "quit", "Completed"] }
    },
    {
      $set: {
        currentQuestion: question.question,
        currentQuestionId: question.questionId
      }
    },
    { new: true }
  );

  if (!updatedInterview) {
    const latestInterview = await getOwnedInterview(interviewId, userId);

    if (latestInterview.currentQuestion) {
      return {
        questionId: latestInterview.currentQuestionId || `q_${Date.now()}`,
        question: latestInterview.currentQuestion,
        currentIndex: latestInterview.currentQuestionIndex + 1,
        totalQuestions: latestInterview.totalQuestions
      };
    }

    if (isCompleted(latestInterview.status)) {
      return null;
    }

    throw new ConflictError("Question state changed. Please retry.");
  }

  return {
    ...question,
    currentIndex: updatedInterview.currentQuestionIndex + 1,
    totalQuestions: updatedInterview.totalQuestions
  };
};

exports.submitAnswer = async (interviewId, userId, answer) => {
  const interview = await getOwnedInterview(interviewId, userId);

  if (isCompleted(interview.status)) {
    throw new ConflictError("Interview already completed");
  }

  const question = interview.currentQuestion;
  if (!question) {
    throw new BadRequestError("No active question found to answer");
  }

  let evaluation;
  try {
    evaluation = await evaluateAnswer({
      role: interview.role,
      question,
      answer
    });
  } catch (err) {
    logger.error("Evaluation failed", {
      interviewId: String(interviewId),
      userId: String(userId),
      message: err.message,
      stack: err.stack
    });
    fs.appendFile("eval_error.log", `${err}\n${err.stack || ""}\n`, () => {});
    throw new BadRequestError("Evaluation failed. Please retry.");
  }

  try {
    await InterviewAnswer.create({
      interviewId,
      question,
      answer,
      score: evaluation.score,
      strengths: evaluation.strengths,
      missing_points: evaluation.missing_points,
      ideal_answer: evaluation.ideal_answer
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new ConflictError("Answer already submitted for this question");
    }
    throw error;
  }

  const nextQuestionIndex = interview.currentQuestionIndex + 1;
  const nextStatus = nextQuestionIndex >= interview.totalQuestions ? "Completed" : interview.status;

  const updatedInterview = await Interview.findOneAndUpdate(
    {
      _id: interviewId,
      userId,
      currentQuestion: question,
      currentQuestionId: interview.currentQuestionId,
      status: { $ne: "Completed" }
    },
    {
      $inc: {
        currentQuestionIndex: 1,
        totalScore: evaluation.score
      },
      $set: {
        status: nextStatus,
        currentQuestion: null,
        currentQuestionId: null
      }
    },
    { new: true }
  );

  if (!updatedInterview) {
    throw new ConflictError("Interview state changed while saving the answer. Please refresh and retry.");
  }

  return {
    ...evaluation,
    interviewCompleted: isCompleted(updatedInterview.status)
  };
};

exports.skipQuestion = async (interviewId, userId) => {
  const interview = await getOwnedInterview(interviewId, userId);

  if (isCompleted(interview.status)) {
    throw new ConflictError("Interview already completed");
  }

  const question = interview.currentQuestion;
  if (!question) {
    return {
      isSkipped: false,
      alreadyProcessing: true,
      interviewCompleted: isCompleted(interview.status)
    };
  }

  try {
    await InterviewAnswer.create({
      interviewId,
      question,
      answer: "SKIPPED",
      score: 0,
      isSkipped: true
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new ConflictError("Question already answered or skipped");
    }
    throw error;
  }

  const nextQuestionIndex = interview.currentQuestionIndex + 1;
  const nextStatus = nextQuestionIndex >= interview.totalQuestions ? "Completed" : interview.status;

  const updatedInterview = await Interview.findOneAndUpdate(
    {
      _id: interviewId,
      userId,
      currentQuestion: question,
      currentQuestionId: interview.currentQuestionId,
      status: { $ne: "Completed" }
    },
    {
      $inc: {
        currentQuestionIndex: 1
      },
      $set: {
        status: nextStatus,
        currentQuestion: null,
        currentQuestionId: null
      }
    },
    { new: true }
  );

  if (!updatedInterview) {
    throw new ConflictError("Interview state changed while skipping the question. Please refresh and retry.");
  }

  return {
    isSkipped: true,
    interviewCompleted: isCompleted(updatedInterview.status)
  };
};

exports.resumeInterview = async (interviewId, userId) => {
  const interview = await getOwnedInterview(interviewId, userId);

  if (isCompleted(interview.status)) {
    throw new ConflictError("Interview already completed");
  }

  const answers = await InterviewAnswer.find({ interviewId })
    .sort({ createdAt: 1 })
    .lean();

  return {
    interviewId,
    role: interview.role,
    topic: interview.topic,
    currentQuestionIndex: interview.currentQuestionIndex,
    totalQuestions: interview.totalQuestions,
    answeredCount: answers.length
  };
};

exports.getInterviewHistory = async (userId) => {
  return Interview.find({ userId })
    .sort({ createdAt: -1 })
    .lean();
};

exports.getInterviewResult = async (interviewId, userId) => {
  const interview = await getOwnedInterview(interviewId, userId);
  const answers = await InterviewAnswer.find({ interviewId }).sort({ createdAt: 1 }).lean();

  return {
    interview,
    answers,
  };
};
