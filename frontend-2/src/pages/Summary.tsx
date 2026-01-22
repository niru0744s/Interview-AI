import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import api from "../lib/axios";

type InterviewSummary = {
    score?: number;
    verdict?: string;
    strengths?: string[];
    weaknesses?: string[];
    feedback?: string;
};

type RouteParams = {
    interviewId: string;
};

export default function Summary() {
    const { interviewId } = useParams<RouteParams>();
    const navigate = useNavigate();

    const [summary, setSummary] = useState<InterviewSummary | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!interviewId) return;

        const fetchSummary = async (): Promise<void> => {
            try {
                const res = await api.post<
                    InterviewSummary | { summary?: InterviewSummary }
                >(`/interviews/${interviewId}/summary`);

                const data =
                    "summary" in res.data ? res.data.summary : (res.data as InterviewSummary);

                if (data === undefined) {
                    throw new Error("Invalid summary response");
                }

                setSummary(data);
            } catch (err) {
                console.error(err);
                setError("Failed to load interview summary");
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, [interviewId]);

    if (loading) {
        return <div className="p-6">Generating summary...</div>;
    }

    if (error) {
        return (
            <div className="p-6 space-y-4">
                <p className="text-red-500">{error}</p>
                <Button onClick={() => navigate("/interviews")}>
                    Back to Interviews
                </Button>
            </div>
        );
    }

    if (!summary) {
        return null;
    }

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-bold">Interview Summary</h1>

            <div className="border rounded p-4 space-y-2">
                <p>
                    <strong>Score:</strong>{" "}
                    {summary.score ?? "N/A"}
                </p>
                <p>
                    <strong>Verdict:</strong>{" "}
                    {summary.verdict ?? "N/A"}
                </p>
            </div>

            <div className="border rounded p-4 space-y-2">
                <h2 className="font-semibold">Strengths</h2>
                {Array.isArray(summary.strengths) &&
                    summary.strengths.length > 0 ? (
                    <ul className="list-disc pl-5">
                        {summary.strengths.map((s, i) => (
                            <li key={i}>{s}</li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-muted-foreground">
                        No strengths recorded
                    </p>
                )}
            </div>

            <div className="border rounded p-4 space-y-2">
                <h2 className="font-semibold">Weaknesses</h2>
                {Array.isArray(summary.weaknesses) &&
                    summary.weaknesses.length > 0 ? (
                    <ul className="list-disc pl-5">
                        {summary.weaknesses.map((w, i) => (
                            <li key={i}>{w}</li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-muted-foreground">
                        No weaknesses recorded
                    </p>
                )}
            </div>

            <div className="border rounded p-4">
                <h2 className="font-semibold">Feedback</h2>
                <p className="whitespace-pre-wrap">
                    {summary.feedback || "No feedback available"}
                </p>
            </div>

            <Button onClick={() => navigate("/interviews")}>
                Back to Interviews
            </Button>
        </div>
    );
}