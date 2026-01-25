const express = require("express");
const router = express.Router();
const {
    createTemplate,
    getMyTemplates,
    getTemplateByInvite,
    getTemplateCandidates,
    getRecruiterStats,
    deleteTemplate
} = require("../controllers/template.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

// Public
router.get("/invite/:code", getTemplateByInvite);

// Recruiter only
router.use(requireAuth);
router.post("/", createTemplate);
router.get("/my", getMyTemplates);
router.get("/stats", getRecruiterStats);
router.get("/:templateId/candidates", getTemplateCandidates);
router.delete("/:id", deleteTemplate);

module.exports = router;
