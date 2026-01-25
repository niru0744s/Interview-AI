const InterviewSummary = require("../models/InterviewSummary");
const Interview = require("../models/Interview");
const mongoose = require("mongoose");

exports.getUserStatsController = async (req, res) => {
    try {
        const userId = req.user._id;

        // 1. Basic Stats
        const totalSessions = await Interview.countDocuments({ userId });
        const completedSessions = await Interview.countDocuments({ userId, status: "Completed" });

        // 2. Consolidate Summary-based Stats using $facet
        const statsAggregation = await InterviewSummary.aggregate([
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
                $facet: {
                    averageScore: [
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
                    ],
                    timeline: [
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
                    ],
                    verdicts: [
                        { $group: { _id: "$verdict", count: { $sum: 1 } } }
                    ],
                    roles: [
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
                    ]
                }
            }
        ]);

        const stats = statsAggregation[0] || { averageScore: [], timeline: [], verdicts: [], roles: [] };

        const averageScore = stats.averageScore.length > 0 ? stats.averageScore[0].avgNormalizedScore : 0;
        const timelineResult = stats.timeline;
        const verdictDistribution = stats.verdicts;
        const rolePerformance = stats.roles;

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
