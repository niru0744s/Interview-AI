import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Loader2, Award, ChevronRight, LayoutDashboard, Search, ChevronLeft } from "lucide-react";
import api from "../lib/axios";
import { cn } from "../lib/utils";

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
                setSummary(res.data.summary);
                setTotalQuestions(res.data.interview.totalQuestions);
                setMeta({ role: res.data.interview.role, topic: res.data.interview.topic });
            } catch (err: unknown) {
                console.error("Fetch summary error:", err);
                const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to load summary";
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, [interviewId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-in fade-in duration-500">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                    <Loader2 className="h-16 w-16 animate-spin text-primary relative" />
                </div>
                <div className="text-center space-y-2">
                    <p className="text-3xl font-black tracking-tight">Generating Performance Logic...</p>
                    <p className="text-muted-foreground text-lg font-medium">AI is analyzing your session results</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-md mx-auto p-12 text-center space-y-6 animate-in zoom-in-95">
                <div className="bg-destructive/10 p-4 rounded-2xl inline-block">
                    <Search className="h-8 w-8 text-destructive" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold">Analysis Failed</h2>
                    <p className="text-muted-foreground">{error}</p>
                </div>
                <Button onClick={() => navigate("/interviews")} variant="outline" className="w-full h-12 rounded-xl font-bold border-2">
                    Return to Dashboard
                </Button>
            </div>
        );
    }

    if (!summary) return null;

    const percentage = summary.score && totalQuestions ? (summary.score / (totalQuestions * 10)) * 100 : 0;

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-10 py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col items-center text-center space-y-3 relative">
                <Button
                    variant="ghost"
                    onClick={() => navigate("/interviews")}
                    className="absolute left-0 top-0 hidden md:flex items-center gap-2 font-bold text-muted-foreground hover:text-primary"
                >
                    <ChevronLeft className="h-5 w-5" /> Back
                </Button>

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-2">
                    <Award className="h-4 w-4" />
                    <span className="text-xs font-black uppercase tracking-widest">Session Complete</span>
                </div>
                <h1 className="text-5xl font-black tracking-tight text-gradient">Interview Insight</h1>
                {meta && (
                    <p className="text-muted-foreground text-xl font-medium">
                        {meta.role} <span className="opacity-30 mx-2">•</span> {meta.topic}
                    </p>
                )}
            </div>


            {/* Score Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="glass-card border-white/5 p-8 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="relative h-40 w-40 flex items-center justify-center">
                        <svg className="h-full w-full -rotate-90">
                            <circle
                                cx="80" cy="80" r="70"
                                className="fill-none stroke-muted stroke-[12]"
                            />
                            <circle
                                cx="80" cy="80" r="70"
                                className="fill-none stroke-primary stroke-[12] transition-all duration-1000 ease-out glow-primary"
                                strokeDasharray={440}
                                strokeDashoffset={440 - (440 * percentage) / 100}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-black leading-none">{summary.score}</span>
                            <span className="text-xs font-bold text-muted-foreground mt-1 uppercase tracking-widest">Total Points</span>
                        </div>
                    </div>
                </Card>

                <Card className="glass-card border-white/5 p-8 space-y-6">
                    <div className="space-y-1">
                        <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Outcome</p>
                        <h2 className={cn(
                            "text-4xl font-black capitalize",
                            summary.verdict === 'hire' ? 'text-green-500' :
                                summary.verdict === 'borderline' ? 'text-yellow-500' : 'text-red-500'
                        )}>
                            {summary.verdict || "Evaluating"}
                        </h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm font-bold">
                            <span className="text-muted-foreground">Session Performance</span>
                            <span>{Math.round(percentage)}%</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div className="h-full btn-premium glow-primary transition-all duration-1000" style={{ width: `${percentage}%` }} />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Feedback Detail */}
            <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="glass-card border-white/5 p-6 space-y-4">
                        <h3 className="text-lg font-black text-green-500 uppercase tracking-widest flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500 glow-green-500/50" />
                            Core Strengths
                        </h3>
                        <ul className="space-y-3">
                            {summary.strengths?.map((s, i) => (
                                <li key={i} className="flex gap-3 text-sm font-medium leading-relaxed">
                                    <ChevronRight className="h-4 w-4 text-primary shrink-0 transition-transform group-hover:scale-125" />
                                    {s}
                                </li>
                            )) || <li className="text-muted-foreground/50 text-sm italic">Analyzing strengths...</li>}
                        </ul>
                    </Card>

                    <Card className="glass-card border-white/5 p-6 space-y-4">
                        <h3 className="text-lg font-black text-orange-400 uppercase tracking-widest flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-orange-400" />
                            Growth Areas
                        </h3>
                        <ul className="space-y-3">
                            {summary.weaknesses?.map((w, i) => (
                                <li key={i} className="flex gap-3 text-sm font-medium leading-relaxed">
                                    <ChevronRight className="h-4 w-4 text-orange-400 shrink-0" />
                                    {w}
                                </li>
                            )) || <li className="text-muted-foreground/50 text-sm italic">Identifying growth points...</li>}
                        </ul>
                    </Card>
                </div>

                <Card className="glass-card border-white/5 p-8 space-y-4">
                    <h3 className="text-lg font-black uppercase tracking-widest text-primary">Executive Summary</h3>
                    <p className="text-lg leading-relaxed font-medium text-foreground/90 whitespace-pre-wrap italic">
                        "{summary.feedback || "No final evaluation provided."}"
                    </p>
                </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button size="lg" variant="outline" onClick={() => navigate("/interviews")} className="flex-1 h-16 rounded-2xl font-black text-lg border-2 border-white/5 hover:bg-muted/50 gap-2">
                    <LayoutDashboard className="h-5 w-5" /> Dashboard
                </Button>
                <Button size="lg" onClick={() => navigate(`/review/${interviewId}`)} className="flex-1 h-16 rounded-2xl btn-premium text-white glow-primary font-black text-lg gap-2">
                    Visual Review <ChevronRight className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
}