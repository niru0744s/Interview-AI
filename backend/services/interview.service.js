const { generateQuestion, evaluateAnswer } = require("./ai.service.js");
const Interview = require("../models/Interview.js");
const InterviewAnswer = require("../models/InterviewAnswer.js");


const MAX_QUESTIONS = 10;

exports.startInterview = async({ userId,role })=> {
   return await Interview.create({
    userId,
    role
  });
}

exports.nextQuestion = async (interviewId)=> {
  const interview = await Interview.findById(interviewId);
  if(!interview) throw new Error("Interview Not Found");
  const asked = await InterviewAnswer.find({ interviewId }).select("question");

  const difficulty =
    interview.currentQuestionIndex < 3
      ? "easy"
      : interview.currentQuestionIndex < 7
      ? "medium"
      : "hard";

  const question = await generateQuestion({
    role: interview.role,
    difficulty,
    askedQuestions: asked.map(q => q.question)
  });
  return question;
}

exports.submitAnswer = async (interviewId, answer) => {

  const interview = await Interview.findById(interviewId);
  if(!interview) throw new Error("Interview Not Found.");

  if (interview.status === "Completed") {
    throw new Error("Interview already completed");
  }

 const lastQuestion = await InterviewAnswer.findOne({ interviewId })
    .sort({ createdAt: -1 })
    .select("question");

  if (!lastQuestion) throw new Error("No question found");

  const question = lastQuestion.question;

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

  if (interview.currentQuestionIndex >= MAX_QUESTIONS) {
     const summary = await generateInterviewSummary(interviewId);
    interview.status = "Completed";
    interview.finalSummary = summary;
  }
  
  await interview.save();
  return {
    ...evaluation,
    interviewCompleted: interview.status === "completed"
  };
};

exports.resumeInterview = async(interviewId)=> {
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
    currentQuestionIndex: interview.currentQuestionIndex,
    answeredCount: answers.length
  };
}

exports.getInterviewHistory = async(req, res)=> {
  const userId = req.user.id;

  const interviews = await Interview.find({ userId })
    .sort({ createdAt: -1 });

  res.json(interviews);
}