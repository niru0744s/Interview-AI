const express = require("express");
const router = express.Router();
const {startInterviewController,nextQuestionController,submitAnswerController, getInterviewResultController , resumeInterviewController, userQuitController} = require("../controllers/interview.controller");
const {requireAuth} = require("../middlewares/auth.middleware");
const { generateAISummary } = require("../services/aiSummary.service");


router.post("/start",requireAuth,startInterviewController);
router.post("/next",requireAuth,nextQuestionController);
router.post("/answer",requireAuth,submitAnswerController);
router.get("/:id/result",requireAuth, getInterviewResultController);
router.get("/:id/resume",requireAuth,resumeInterviewController);
router.post("/:interviewId/quit",requireAuth,userQuitController);
router.post("/:interviewId/summary",requireAuth,generateAISummary);

module.exports = router;