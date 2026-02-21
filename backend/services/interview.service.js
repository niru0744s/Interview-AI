const { generateQuestion, evaluateAnswer } = require("./ai.service.js");
const Interview = require("../models/Interview.js");
const InterviewAnswer = require("../models/InterviewAnswer.js");


exports.startInterview = async ({ userId, role, topic, totalQuestions, resumeContent, resumeUrl, resumeData, templateId, difficulty }) => {
  return await Interview.create({
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
}

exports.nextQuestion = async (interviewId) => {
  const interview = await Interview.findById(interviewId);
  if (!interview) throw new Error("Interview Not Found");

  if (interview.status.toLowerCase() === "completed") {
    return null;
  }

  // If there's already a current question that hasn't been answered, return it
  if (interview.currentQuestion) {
    return {
      questionId: interview.currentQuestionId || `q_${Date.now()}`,
      question: interview.currentQuestion,
      currentIndex: interview.currentQuestionIndex + 1,
      totalQuestions: interview.totalQuestions
    };
  }

  const asked = await InterviewAnswer.find({ interviewId }).select("question score");

  // Baseline Difficulty mapping
  const difficultyMap = {
    beginner: "easy",
    intermediate: "medium",
    professional: "hard"
  };

  let difficulty = difficultyMap[interview.difficulty] || "medium";

  // Adaptive Difficulty Logic - Shift based on performance
  if (interview.currentQuestionIndex > 0 && asked.length > 0) {
    const totalScore = asked.reduce((sum, ans) => sum + (ans.score || 0), 0);
    const avgScore = totalScore / asked.length;

    if (avgScore > 8) difficulty = "hard";
    else if (avgScore < 5) difficulty = "easy";
    // else stay at baseline or medium
  }

  const question = await generateQuestion({
    role: interview.role,
    topic: interview.topic,
    difficulty,
    askedQuestions: asked.map(q => q.question),
    resumeContent: interview.resumeContent,
    resumeData: interview.resumeData
  });

  const questionData = {
    ...question,
    currentIndex: interview.currentQuestionIndex + 1, // 1-indexed for UI
    totalQuestions: interview.totalQuestions
  };

  interview.currentQuestion = question.question;
  interview.currentQuestionId = question.questionId;
  await interview.save();

  return questionData;
}

exports.submitAnswer = async (interviewId, answer) => {

  const interview = await Interview.findById(interviewId);
  if (!interview) throw new Error("Interview Not Found.");

  if (interview.status.toLowerCase() === "completed") {
    throw new Error("Interview already completed");
  }

  const question = interview.currentQuestion;
  if (!question) throw new Error("No active question found to answer");

  const alreadyAnswered = await InterviewAnswer.findOne({
    interviewId,
    question,
    answer: { $exists: true }
  });

  if (alreadyAnswered) {
    throw new Error("Answer already submitted for this question");
  }

  let evaluation;
  try {
    evaluation = await evaluateAnswer({
      role: interview.role,
      question,
      answer
    });
  } catch (err) {
    throw new Error("Evaluation failed. Please retry.");
  }

  await InterviewAnswer.create({
    interviewId,
    question,
    answer,
    score: evaluation.score,
    strengths: evaluation.strengths,
    missing_points: evaluation.missing_points,
    ideal_answer: evaluation.ideal_answer
  });

  interview.currentQuestionIndex += 1;
  interview.totalScore += evaluation.score;

  if (interview.currentQuestionIndex >= interview.totalQuestions) {
    interview.status = "Completed";
  }

  interview.currentQuestion = null; // Clear the current question after answering
  interview.currentQuestionId = null;
  await interview.save();
  return {
    ...evaluation,
    interviewCompleted: interview.status.toLowerCase() === "completed"
  };
};

exports.skipQuestion = async (interviewId) => {
  const interview = await Interview.findById(interviewId);
  if (!interview) throw new Error("Interview Not Found");

  if (interview.status.toLowerCase() === "completed") {
    throw new Error("Interview already completed");
  }

  const question = interview.currentQuestion;
  if (!question) {
    // If no active question, we might be in-between questions (generating next)
    // Return a flag to tell the caller we are already moving forward
    return {
      isSkipped: false,
      alreadyProcessing: true,
      interviewCompleted: interview.status.toLowerCase() === "completed"
    };
  }

  await InterviewAnswer.create({
    interviewId,
    question,
    answer: "SKIPPED",
    score: 0,
    isSkipped: true
  });

  interview.currentQuestionIndex += 1;
  // Total score stays the same (adding 0)

  if (interview.currentQuestionIndex >= interview.totalQuestions) {
    interview.status = "Completed";
  }

  interview.currentQuestion = null;
  interview.currentQuestionId = null;
  await interview.save();

  return {
    isSkipped: true,
    interviewCompleted: interview.status.toLowerCase() === "completed"
  };
};

exports.resumeInterview = async (interviewId) => {
  const interview = await Interview.findById(interviewId);
  if (!interview) throw new Error("Interview not found");

  if (interview.status === "completed") {
    throw new Error("Interview already completed");
  }

  const answers = await InterviewAnswer.find({ interviewId })
    .sort({ createdAt: 1 });

  return {
    interviewId,
    role: interview.role,
    topic: interview.topic,
    currentQuestionIndex: interview.currentQuestionIndex,
    totalQuestions: interview.totalQuestions,
    answeredCount: answers.length
  };
}

exports.getInterviewHistory = async (req, res) => {
  const userId = req.user.id;

  const interviews = await Interview.find({ userId })
    .sort({ createdAt: -1 });

  res.json(interviews);
}