const { generateDetailedSummary } = require("./ai.service");

exports.generateAISummary = async (interviewPayload) => {
  const {
    totalQuestions,
    answers,
    status,
    role,
    topic
  } = interviewPayload;

  try {
    const questionsAndAnswers = answers.map(a => ({
      question: a.question,
      answer: a.answer,
      score: a.score || 0
    }));

    const aiResult = await generateDetailedSummary({
      role: role || "Software Engineer",
      topic: topic || "Technical",
      questionsAndAnswers,
      status
    });

    return aiResult;
  } catch (err) {
    console.error("AI Summary generation failed, falling back to heuristics:", err);

    // Heuristic Fallback
    const answeredCount = answers.filter(a => !a.isSkipped).length;
    const totalScore = answers.reduce((sum, ans) => sum + (ans.score || 0), 0);
    const performanceRatio = answeredCount > 0 ? totalScore / (answeredCount * 10) : 0;

    let verdict = "borderline";
    if (performanceRatio > 0.8) verdict = "hire";
    else if (performanceRatio < 0.5) verdict = "reject";

    return {
      score: totalScore,
      verdict,
      strengths: ["Consistency in answering"],
      weaknesses: ["Opportunity for deeper technical detail"],
      feedback: `You answered ${answeredCount} questions. Your average quality was ${Math.round(performanceRatio * 100)}%.`
    };
  }
};
