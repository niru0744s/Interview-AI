exports.generateAISummary = async (interviewPayload) => {
  const {
    totalQuestions,
    answers,
    status,
  } = interviewPayload;

  const answeredCount = answers.length;

  // Sum up the actual scores from each answer
  const totalScore = answers.reduce((sum, ans) => sum + (ans.score || 0), 0);
  const maxPossibleScore = totalQuestions * 10;

  const completionRatio = answeredCount / totalQuestions;
  const performanceRatio = answeredCount > 0 ? totalScore / (answeredCount * 10) : 0;

  // Final score is the sum of points
  let score = totalScore;
  let verdict = "borderline";

  if (performanceRatio > 0.8 && completionRatio > 0.8) verdict = "hire";
  else if (performanceRatio < 0.5 || completionRatio < 0.5) verdict = "reject";

  const strengths = answers.flatMap(a => a.strengths || []).slice(0, 3);
  const weaknesses = answers.flatMap(a => a.missing_points || []).slice(0, 3);

  if (status === "quit") {
    weaknesses.push("Interview was not completed");
  }

  return {
    score,
    verdict,
    strengths: strengths.length > 0 ? strengths : ["Consistency in answering"],
    weaknesses: weaknesses.length > 0 ? weaknesses : ["Opportunity for deeper technical detail"],
    feedback: status === "quit"
      ? "The interview ended early. While your answers showed promise, completing the full set of questions is recommended for a definitive evaluation."
      : `You completed ${answeredCount} of ${totalQuestions} questions with an average quality of ${Math.round(performanceRatio * 100)}%. ${performanceRatio > 0.7 ? "Great job!" : "Keep practicing to improve your technical depth."}`
  };
};
