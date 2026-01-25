const express = require("express");
const router = express.Router();
const { startInterviewController, nextQuestionController, submitAnswerController, skipQuestionController, getInterviewResultController, resumeInterviewController, userQuitController, generateInterviewSummaryController, getInterviewDetailController } = require("../controllers/interview.controller");
const { getUserStatsController } = require("../controllers/stats.controller");
const { getInterviewHistory } = require("../services/interview.service");
const { requireAuth } = require("../middlewares/auth.middleware");

router.get("/stats", requireAuth, getUserStatsController);
router.get("/", requireAuth, getInterviewHistory);
router.post("/start", requireAuth, startInterviewController);
router.post("/next", requireAuth, nextQuestionController);
router.post("/skip", requireAuth, skipQuestionController);
router.post("/answer", requireAuth, submitAnswerController);
router.get("/:id/result", requireAuth, getInterviewResultController);
router.get("/:id/resume", requireAuth, resumeInterviewController);
router.get("/:id/detail", requireAuth, getInterviewDetailController);
router.post("/:interviewId/quit", requireAuth, userQuitController);
router.post("/:interviewId/summary", requireAuth, generateInterviewSummaryController);

module.exports = router;