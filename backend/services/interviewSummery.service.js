const InterviewAnswer = require("../models/InterviewAnswer.js");

exports.generateInterviewSummary = async(interviewId)=> {
  const answers = await InterviewAnswer.find({ interviewId });

  if (answers.length === 0) {
    throw new Error("No answers found");
  }

  const total = answers.reduce((sum, a) => sum + a.score, 0);
  const averageScore = Math.round((total / answers.length) * 10) / 10;

  const strengths = [];
  const weaknesses = [];

  answers.forEach(a => {
    if (a.score >= 7) strengths.push(...a.strengths);
    if (a.score <= 4) weaknesses.push(...a.missing_points);
  });

  return {
    averageScore,
    strengths: [...new Set(strengths)],
    weaknesses: [...new Set(weaknesses)]
  };
};