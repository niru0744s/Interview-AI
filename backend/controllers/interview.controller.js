const { startInterview,nextQuestion,submitAnswer,getInterviewResult } = require("../services/interview.service.js");
const {Interview} = require("../models/Interview.js");

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

exports.userQuitController = async(req,res)=>{
  try {
    const {interviewId} = req.body;
    await Interview.findByIdAndUpdate(interviewId,{
      status:"Completed",
      endedReason:"User Terminated",
    });
  } catch (error) {
    res.status(500).json({error:error.message});
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