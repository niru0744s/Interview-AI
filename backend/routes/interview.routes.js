const express = require("express");
const router = express.Router();
const {startInterviewController,nextQuestionCOntroller,submitAnswerController} = require("../controllers/interview.controller");


router.post("/start",startInterviewController);
router.post("/next",nextQuestionCOntroller);
router.post("/answer",submitAnswerController);

module.exports = router;