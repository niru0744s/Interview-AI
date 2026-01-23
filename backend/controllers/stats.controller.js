const InterviewSummary = require("../models/InterviewSummary");
const Interview = require("../models/Interview");
const mongoose = require("mongoose");

exports.getUserStatsController = async (req, res) => {
    try {
        const userId = req.user._id;

        // 1. Basic Stats
        const totalSessions = await Interview.countDocuments({ userId });
        const completedSessions = await Interview.countDocuments({ userId, status: "Completed" });

        // 2. Average Score normalized to 10
        const averageScoreResult = await InterviewSummary.aggregate([
            { $match: { user: userId } },
            {
                $lookup: {
                    from: "interviews",
                    localField: "interview",
                    foreignField: "_id",
                    as: "interviewData"
                }
            },
            { $unwind: "$interviewData" },
            {
                $group: {
                    _id: null,
                    avgNormalizedScore: {
                        $avg: {
                            $divide: [
                                "$score",
                                { $ifNull: ["$interviewData.totalQuestions", 10] }
                            ]
                        }
                    }
                }
            }
        ]);
        const averageScore = averageScoreResult.length > 0 ? averageScoreResult[0].avgNormalizedScore : 0;

        // 3. Performance Timeline (Score normalized to 10 over time)
        const timelineResult = await InterviewSummary.aggregate([
            { $match: { user: userId } },
            {
                $lookup: {
                    from: "interviews",
                    localField: "interview",
                    foreignField: "_id",
                    as: "interviewData"
                }
            },
            { $unwind: "$interviewData" },
            { $sort: { createdAt: 1 } },
            {
                $project: {
                    score: {
                        $divide: [
                            "$score",
                            { $ifNull: ["$interviewData.totalQuestions", 10] }
                        ]
                    },
                    date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
                }
            }
        ]);

        // 4. Verdict Distribution
        const verdictDistribution = await InterviewSummary.aggregate([
            { $match: { user: userId } },
            { $group: { _id: "$verdict", count: { $sum: 1 } } }
        ]);

        // 5. Role Performance normalized to 10
        const rolePerformance = await InterviewSummary.aggregate([
            { $match: { user: userId } },
            {
                $lookup: {
                    from: "interviews",
                    localField: "interview",
                    foreignField: "_id",
                    as: "interviewData"
                }
            },
            { $unwind: "$interviewData" },
            {
                $group: {
                    _id: "$interviewData.role",
                    avgNormalizedScore: {
                        $avg: {
                            $divide: [
                                "$score",
                                { $ifNull: ["$interviewData.totalQuestions", 10] }
                            ]
                        }
                    },
                    sessions: { $sum: 1 }
                }
            },
            { $sort: { avgNormalizedScore: -1 } }
        ]);

        res.json({
            totalSessions,
            completedSessions,
            averageScore: Math.round(averageScore * 10) / 10,
            performanceTimeline: timelineResult,
            verdictDistribution: verdictDistribution.map(item => ({
                name: item._id,
                value: item.count
            })),
            rolePerformance: rolePerformance.map(item => ({
                role: item._id,
                avgScore: Math.round(item.avgNormalizedScore * 10) / 10,
                sessions: item.sessions
            }))
        });

    } catch (error) {
        console.error("Stats generation error:", error);
        res.status(500).json({ message: "Failed to generate stats", error: error.message });
    }
};
