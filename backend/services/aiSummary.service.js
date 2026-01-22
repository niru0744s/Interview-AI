exports.generateAISummary = async (interviewPayload) => {
  const {
    questions,
    answers,
    status,
    quitReason
  } = interviewPayload;

  const answeredCount = answers.length;
  const totalQuestions = questions.length;

  const completionRatio = answeredCount / totalQuestions;

  let score = Math.round(completionRatio * 100);
  let verdict = "borderline";

  if (completionRatio > 0.75) verdict = "hire";
  if (completionRatio < 0.4) verdict = "reject";

  if (status === "quit") {
    score = Math.min(score, 50);
  }

  return {
    score,
    verdict,
    strengths: [
      "Answered questions clearly",
      "Maintained consistency in responses"
    ],
    weaknesses: status === "quit"
      ? ["Interview was not completed"]
      : ["Needs deeper technical explanations"],
    feedback:
      status === "quit"
        ? "Interview was ended early. Completing the full interview is recommended for accurate evaluation."
        : "Overall performance was acceptable. Focus on improving depth and clarity."
  };
};
