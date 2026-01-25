const JobTemplate = require("../models/JobTemplate");
const Interview = require("../models/Interview");
const crypto = require("crypto");

// Create a new job template
exports.createTemplate = async (req, res) => {
    try {
        const { title, role, topic, description, totalQuestions, difficulty } = req.body;
        const recruiterId = req.user._id; // Assuming auth middleware attaches user

        const inviteCode = crypto.randomBytes(4).toString("hex").toUpperCase();

        const template = await JobTemplate.create({
            recruiterId,
            title,
            role,
            topic,
            description,
            totalQuestions: totalQuestions ? parseInt(totalQuestions) : 10,
            difficulty: difficulty || "intermediate",
            inviteCode
        });

        res.status(201).json(template);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get recruiter's templates
exports.getMyTemplates = async (req, res) => {
    try {
        const templates = await JobTemplate.find({ recruiterId: req.user._id })
            .sort({ createdAt: -1 });
        res.json(templates);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get template details by invite code (public endpoint)
exports.getTemplateByInvite = async (req, res) => {
    try {
        const { code } = req.params;
        const template = await JobTemplate.findOne({ inviteCode: code.toUpperCase(), isActive: true });

        if (!template) {
            return res.status(404).json({ error: "Invalid or inactive invite code" });
        }

        res.json(template);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get candidates for a template
exports.getTemplateCandidates = async (req, res) => {
    try {
        const { templateId } = req.params;
        const template = await JobTemplate.findById(templateId);

        if (!template || template.recruiterId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Access denied" });
        }

        const interviews = await Interview.find({ templateId })
            .populate("userId", "email")
            .sort({ totalScore: -1 });

        res.json(interviews);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get aggregated stats for recruiter
exports.getRecruiterStats = async (req, res) => {
    try {
        const recruiterId = req.user._id;

        // Find all templates owned by this recruiter
        const templates = await JobTemplate.find({ recruiterId });
        const templateIds = templates.map(t => t._id);

        // Count all interviews across these templates
        const totalCandidates = await Interview.countDocuments({
            templateId: { $in: templateIds },
            status: { $ne: "in_progress" } // Only count completed or quit interviews for stats? 
            // Actually, let's count all who joined.
        });

        // Count top hires (score > 75% of max possible score)
        // This is tricky because templates have different totalQuestions.
        // We'll aggregate based on completion ratio * average score or just raw score for now.
        // For simplicity: score > (totalQuestions * 10 * 0.75)

        let topHires = 0;
        const interviews = await Interview.find({
            templateId: { $in: templateIds },
            status: "Completed"
        });

        for (const interview of interviews) {
            const template = templates.find(t => t._id.toString() === interview.templateId.toString());
            if (template) {
                const maxScore = template.totalQuestions * 10;
                if (interview.totalScore >= maxScore * 0.75) {
                    topHires++;
                }
            }
        }

        res.json({
            activePosts: templates.length,
            totalCandidates,
            topHires
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete a job template
exports.deleteTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const template = await JobTemplate.findById(id);

        if (!template || template.recruiterId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Access denied" });
        }

        await JobTemplate.findByIdAndDelete(id);
        res.json({ message: "Template deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
