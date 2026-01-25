import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import api from "../lib/axios";
import { Loader2, ChevronLeft } from "lucide-react";
import ReviewSummaryHeader from "../components/review/ReviewSummaryHeader";
import ReviewAnswerCard from "../components/review/ReviewAnswerCard";

type Answer = {
    _id: string;
    question: string;
    answer: string;
    score: number;
    strengths: string[];
    missing_points: string[];
    ideal_answer: string;
};

type InterviewData = {
    interview: {
        _id: string;
        role: string;
        topic: string;
        status: string;
        totalQuestions: number;
        createdAt: string;
    };
    answers: Answer[];
    summary?: {
        score: number;
        feedback: string;
        verdict: string;
    };
};

export default function ReviewSession() {
    const { interviewId } = useParams<{ interviewId: string }>();
    const navigate = useNavigate();
    const [data, setData] = useState<InterviewData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await api.get<InterviewData>(`/interview/${interviewId}/detail`);
                setData(res.data);
            } catch (error) {
                console.error("Failed to fetch interview detail", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [interviewId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Loading session details...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="max-w-2xl mx-auto p-12 text-center space-y-4">
                <h2 className="text-2xl font-bold">Session Not Found</h2>
                <p className="text-muted-foreground">We couldn't find the details for this interview session.</p>
                <Button onClick={() => navigate("/interviews")}>Back to Dashboard</Button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-8">
            <div className="flex items-center gap-6 border-b border-white/5 pb-8">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate("/interviews")}
                    className="h-12 w-12 rounded-2xl hover:bg-white/5 border border-white/10"
                >
                    <ChevronLeft className="h-6 w-6" />
                </Button>
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Technical Analysis</span>
                        <div className="h-1 w-1 rounded-full bg-white/20" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{new Date(data.interview.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight leading-none">{data.interview.role}</h1>
                    <p className="text-muted-foreground font-medium">
                        {data.interview.topic} • {data.answers.length} Questions Evaluated
                    </p>
                </div>
            </div>

            {data.summary && (
                <ReviewSummaryHeader
                    score={data.summary.score}
                    totalQuestions={data.interview.totalQuestions}
                    verdict={data.summary.verdict}
                    feedback={data.summary.feedback}
                />
            )}

            <div className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    Question Breakdown
                    <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        Detailed Analysis
                    </span>
                </h2>

                {data.answers.map((item, index) => (
                    <ReviewAnswerCard key={item._id} answer={item} index={index} />
                ))}
            </div>
        </div>
    );
}
