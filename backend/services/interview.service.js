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

exports.startInterview = async ({ userId, role, topic, totalQuestions, resumeContent, resumeUrl, resumeData, templateId, difficulty, questionFormat, category }) => {
  return Interview.create({
    userId,
    role,
    topic: topic || "General",
    totalQuestions: totalQuestions || 10,
    resumeContent: resumeContent || null,
    resumeUrl: resumeUrl || null,
    resumeData: resumeData || null,
    templateId: templateId || null,
    difficulty: difficulty || "intermediate",
    questionFormat: questionFormat || "blend",
    category: category || "technical"
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
      type: interview.currentQuestionType || "conceptual",
      options: interview.currentQuestionOptions || [],
      codeTemplate: interview.currentQuestionMeta?.codeTemplate || null,
      language: interview.currentQuestionMeta?.language || null,
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

  const alreadyAsked = asked.map((item) => item.question?.trim().toLowerCase()).filter(Boolean);

  let question = await generateQuestion({
    role: interview.role,
    topic: interview.topic,
    difficulty,
    questionFormat: interview.questionFormat || "blend",
    category: interview.category || "technical",
    askedQuestions: asked.map((item) => item.question),
    resumeContent: interview.resumeContent,
    resumeData: interview.resumeData,
    questionIndex: interview.currentQuestionIndex,
    totalQuestions: interview.totalQuestions
  });

  // If AI generated a question that was already asked, regenerate once to prevent duplicate questions
  if (question && alreadyAsked.includes(question.question?.trim().toLowerCase())) {
    logger.warn("AI generated a duplicate question, regenerating with explicit prohibition", {
      interviewId: String(interviewId),
      duplicateQuestion: question.question
    });
    question = await generateQuestion({
      role: interview.role,
      topic: interview.topic,
      difficulty,
      questionFormat: interview.questionFormat || "blend",
      category: interview.category || "technical",
      askedQuestions: [...asked.map((item) => item.question), question.question],
      resumeContent: interview.resumeContent,
      resumeData: interview.resumeData,
      questionIndex: interview.currentQuestionIndex,
      totalQuestions: interview.totalQuestions
    });
  }

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
        currentQuestionId: question.questionId,
        currentQuestionType: question.type || "conceptual",
        currentQuestionOptions: question.options || [],
        currentQuestionMeta: {
          codeTemplate: question.codeTemplate || null,
          language: question.language || null,
          correctAnswers: question.correctAnswers || []
        }
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
        type: latestInterview.currentQuestionType || "conceptual",
        options: latestInterview.currentQuestionOptions || [],
        codeTemplate: latestInterview.currentQuestionMeta?.codeTemplate || null,
        language: latestInterview.currentQuestionMeta?.language || null,
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
    questionId: updatedInterview.currentQuestionId,
    question: updatedInterview.currentQuestion,
    type: updatedInterview.currentQuestionType || "conceptual",
    options: updatedInterview.currentQuestionOptions || [],
    codeTemplate: updatedInterview.currentQuestionMeta?.codeTemplate || null,
    language: updatedInterview.currentQuestionMeta?.language || null,
    currentIndex: updatedInterview.currentQuestionIndex + 1,
    totalQuestions: updatedInterview.totalQuestions
  };
};

exports.submitAnswer = async (interviewId, userId, payload) => {
  const interview = await getOwnedInterview(interviewId, userId);

  if (isCompleted(interview.status)) {
    throw new ConflictError("Interview already completed");
  }

  const question = interview.currentQuestion;
  if (!question) {
    throw new BadRequestError("No active question found to answer");
  }

  const questionType = interview.currentQuestionType || "conceptual";
  const answerText = typeof payload === "object" ? (payload?.answer || "") : (payload || "");
  const selectedOptions = typeof payload === "object" ? (payload?.selectedOptions || []) : [];
  const code = typeof payload === "object" ? (payload?.code || "") : "";
  const language = typeof payload === "object" ? (payload?.language || "javascript") : "javascript";
  const correctAnswers = interview.currentQuestionMeta?.correctAnswers || [];

  let evaluation;
  try {
    evaluation = await evaluateAnswer({
      role: interview.role,
      question,
      answer: answerText,
      questionType,
      category: interview.category || "technical",
      selectedOptions,
      code,
      language,
      correctAnswers
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
      questionIndex: interview.currentQuestionIndex,
      question,
      questionType,
      answer: answerText,
      selectedOptions,
      codeAnswer: {
        code: code || null,
        language: language || null
      },
      score: evaluation.score,
      strengths: evaluation.strengths,
      missing_points: evaluation.missing_points,
      ideal_answer: evaluation.ideal_answer
    });
  } catch (error) {
    if (error.code === 11000) {
      logger.warn("Answer record already exists for question, updating existing record", {
        interviewId: String(interviewId),
        question
      });
      await InterviewAnswer.findOneAndUpdate(
        { interviewId, question },
        {
          $set: {
            questionIndex: interview.currentQuestionIndex,
            questionType,
            answer: answerText,
            selectedOptions,
            codeAnswer: {
              code: code || null,
              language: language || null
            },
            score: evaluation.score,
            strengths: evaluation.strengths,
            missing_points: evaluation.missing_points,
            ideal_answer: evaluation.ideal_answer,
            isSkipped: false
          }
        }
      );
    } else {
      throw error;
    }
  }

  const nextQuestionIndex = interview.currentQuestionIndex + 1;
  const nextStatus = nextQuestionIndex >= interview.totalQuestions ? "Completed" : interview.status;

  const updatedInterview = await Interview.findOneAndUpdate(
    {
      _id: interviewId,
      userId,
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
        currentQuestionId: null,
        currentQuestionType: "conceptual",
        currentQuestionOptions: [],
        currentQuestionMeta: null
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
      questionIndex: interview.currentQuestionIndex,
      question,
      questionType: interview.currentQuestionType || "conceptual",
      answer: "SKIPPED",
      score: 0,
      isSkipped: true
    });
  } catch (error) {
    if (error.code === 11000) {
      logger.warn("Question already recorded, updating to skipped", {
        interviewId: String(interviewId),
        question
      });
      await InterviewAnswer.findOneAndUpdate(
        { interviewId, question },
        {
          $set: {
            questionIndex: interview.currentQuestionIndex,
            questionType: interview.currentQuestionType || "conceptual",
            answer: "SKIPPED",
            score: 0,
            isSkipped: true
          }
        }
      );
    } else {
      throw error;
    }
  }

  const nextQuestionIndex = interview.currentQuestionIndex + 1;
  const nextStatus = nextQuestionIndex >= interview.totalQuestions ? "Completed" : interview.status;

  const updatedInterview = await Interview.findOneAndUpdate(
    {
      _id: interviewId,
      userId,
      status: { $ne: "Completed" }
    },
    {
      $inc: {
        currentQuestionIndex: 1
      },
      $set: {
        status: nextStatus,
        currentQuestion: null,
        currentQuestionId: null,
        currentQuestionType: "conceptual",
        currentQuestionOptions: [],
        currentQuestionMeta: null
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
    category: interview.category || "technical",
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
