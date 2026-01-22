const { startInterview,nextQuestion,submitAnswer,getInterviewResult,resumeInterview } = require("../services/interview.service.js");
const {Interview} = require("../models/Interview.js");
const InterviewSummary = require("../models/InterviewSummary.js");
const {generateAISummary} = require("../services/aiSummary.service.js");

exports.startInterviewController = async (req, res) => {
  try {
    const { role } = req.body;
    if (!role) {
      return res.status(400).json({ error: "Role is required" });
    }
    const userId = "66abc123fakeuserid";
    const interview = await startInterview({ userId, role });
    res.json({ interviewId: interview._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


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
    const existing = await InterviewAnswer.findOne({ interviewId, question });
      if (existing) {
        throw new Error("Answer already submitted for this question");
      }
      let evaluation;
      try {
        evaluation = await submitAnswer({ interviewId, answer });
      } catch (error) {
        throw new Error("Evaluation failed , Please retry!");
      }
    res.json(evaluation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.userQuitController = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const userId = req.user.id;

    const interview = await Interview.findOne({
      _id: interviewId,
      user: userId
    });

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    if (interview.status === "quit" || interview.status === "completed") {
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

exports.resumeInterviewController = async(req,res) =>{
  try {
    const resume = await resumeInterview(req.params.id);
    res.json(resume);
  } catch (error) {
    res.status(404).json({error: error.message});
  }
};

exports.generateInterviewSummaryController = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const userId = req.user.id;

    const interview = await Interview.findOne({
      _id: interviewId,
      user: userId
    });

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    const existingSummary = await InterviewSummary.findOne({ interview: interviewId });
    if (existingSummary) {
      return res.status(200).json({
        message: "Summary already generated",
        summary: existingSummary
      });
    }

    if (interview.status === "in_progress") {
      return res.status(400).json({
        message: "Interview is still in progress"
      });
    }

    const interviewPayload = {
      questions: interview.questions,
      answers: interview.answers,
      status: interview.status,
      quitReason: interview.quitReason || null,
      startedAt: interview.startedAt,
      endedAt: interview.endedAt
    };

    const aiResult = await generateAISummary(interviewPayload);

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
      summary: summaryDoc
    });

  } catch (err) {
    console.error("Interview summary error:", err);
    return res.status(500).json({
      message: "Failed to generate interview summary"
    });
  }
};