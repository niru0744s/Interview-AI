import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Loader2 } from "lucide-react";
import api from "../lib/axios";

type InterviewSummary = {
    score?: number;
    verdict?: string;
    strengths?: string[];
    weaknesses?: string[];
    feedback?: string;
};

type SummaryResponse = {
    summary: InterviewSummary;
    interview: {
        role: string;
        topic: string;
        totalQuestions: number;
    };
};

type RouteParams = {
    interviewId: string;
};

export default function Summary() {
    const { interviewId } = useParams<RouteParams>();
    const navigate = useNavigate();
    const isFetching = useRef(false);

    const [summary, setSummary] = useState<InterviewSummary | null>(null);
    const [totalQuestions, setTotalQuestions] = useState<number>(0);
    const [meta, setMeta] = useState<{ role: string; topic: string } | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!interviewId || isFetching.current) return;

        const fetchSummary = async (): Promise<void> => {
            isFetching.current = true;
            try {
                const res = await api.post<SummaryResponse>(`/interview/${interviewId}/summary`);
                console.log("Summary response:", res.data);

                setSummary(res.data.summary);
                setTotalQuestions(res.data.interview.totalQuestions);
                setMeta({ role: res.data.interview.role, topic: res.data.interview.topic });
            } catch (err: unknown) {
                console.error("Fetch summary error:", err);
                const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to load interview summary";
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, [interviewId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-lg font-medium">Generating your interview summary...</p>
                <p className="text-sm text-muted-foreground">This may take a few moments as AI analyzes your performance.</p>
            </div>
        );
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
            <div className="space-y-1">
                <h1 className="text-3xl font-bold">Interview Summary</h1>
                {meta && (
                    <p className="text-muted-foreground font-medium">
                        {meta.role} {meta.topic && `• ${meta.topic}`}
                    </p>
                )}
            </div>

            <div className="border rounded p-4 space-y-2">
                <p>
                    <strong>Score:</strong>{" "}
                    {summary.score ?? "N/A"} / {totalQuestions * 10}
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

            <div className="flex gap-4">
                <Button variant="outline" onClick={() => navigate("/interviews")}>
                    Back to Dashboard
                </Button>
                <Button onClick={() => navigate(`/review/${interviewId}`)}>
                    View Detailed Review
                </Button>
            </div>
        </div>
    );
}