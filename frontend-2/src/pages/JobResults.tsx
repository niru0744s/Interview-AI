import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
    ChevronLeft,
    Users,
    Trophy,
    Clock,
    FileText,
    CheckCircle2,
    AlertCircle,
    Loader2,
    ChevronRight
} from "lucide-react";
import api from "../lib/axios";
import { cn } from "../lib/utils";
import { toast } from "sonner";

export default function JobResults() {
    const { templateId } = useParams();
    const navigate = useNavigate();
    const [candidates, setCandidates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                const res = await api.get(`/templates/${templateId}/candidates`);
                setCandidates(res.data);
            } catch (err) {
                toast.error("Failed to load candidate results");
            } finally {
                setLoading(false);
            }
        };
        fetchCandidates();
    }, [templateId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-8 pt-24">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => navigate("/recruiter")}
                        className="rounded-full h-12 w-12 p-0 hover:bg-primary/10 transition-colors"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black tracking-tight text-gradient">Candidate Leaderboard</h1>
                        <p className="text-muted-foreground font-medium">Review top performers and session insights.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="glass-card border-white/10 p-6 flex flex-col items-center justify-center text-center space-y-2">
                        <Users className="h-8 w-8 text-primary" />
                        <CardTitle className="text-3xl font-black">{candidates.length}</CardTitle>
                        <CardDescription className="uppercase text-[10px] font-bold tracking-widest">Applicants</CardDescription>
                    </Card>
                    <Card className="glass-card border-white/10 p-6 flex flex-col items-center justify-center text-center space-y-2">
                        <Trophy className="h-8 w-8 text-yellow-500" />
                        <CardTitle className="text-3xl font-black">
                            {candidates.filter(c => c.status === "Completed").length}
                        </CardTitle>
                        <CardDescription className="uppercase text-[10px] font-bold tracking-widest">Completed</CardDescription>
                    </Card>
                    <Card className="glass-card border-white/10 p-6 flex flex-col items-center justify-center text-center space-y-2">
                        <Clock className="h-8 w-8 text-blue-400" />
                        <CardTitle className="text-3xl font-black">
                            {candidates.filter(c => c.status === "in_progress").length}
                        </CardTitle>
                        <CardDescription className="uppercase text-[10px] font-bold tracking-widest">In Progress</CardDescription>
                    </Card>
                    <Card className="glass-card border-white/10 p-6 flex flex-col items-center justify-center text-center space-y-2">
                        <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                        <CardTitle className="text-3xl font-black">
                            {candidates.filter(c => c.totalScore > 70).length}
                        </CardTitle>
                        <CardDescription className="uppercase text-[10px] font-bold tracking-widest">Qualified</CardDescription>
                    </Card>
                </div>

                <div className="glass-card border-white/10 rounded-3xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 bg-accent/30 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                                    <th className="p-6">Candidate</th>
                                    <th className="p-6">Status</th>
                                    <th className="p-6">Overall Score</th>
                                    <th className="p-6 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {candidates.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-12 text-center text-muted-foreground font-medium italic">
                                            No candidates have attempted this interview yet.
                                        </td>
                                    </tr>
                                ) : (
                                    candidates.map((candidate) => (
                                        <tr key={candidate._id} className="group hover:bg-white/5 transition-colors">
                                            <td className="p-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black uppercase">
                                                        {candidate.userId?.email?.[0] || "?"}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-foreground/90">{candidate.userId?.email}</span>
                                                        <span className="text-xs text-muted-foreground">ID: {candidate._id.slice(-6).toUpperCase()}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <div className={cn(
                                                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                                    candidate.status === "Completed" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                                                        candidate.status === "in_progress" ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" :
                                                            "bg-orange-500/10 text-orange-500 border border-orange-500/20"
                                                )}>
                                                    {candidate.status === "Completed" ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                                                    {candidate.status.replace("_", " ")}
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex-1 max-w-[100px] h-2 bg-muted rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-primary glow-primary"
                                                            style={{ width: `${(candidate.totalScore / (candidate.totalQuestions * 10)) * 100}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-lg font-black text-foreground">
                                                        {candidate.totalScore}
                                                        <span className="text-xs text-muted-foreground font-medium ml-1">/ {candidate.totalQuestions * 10}</span>
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-6 text-right">
                                                <Button
                                                    size="sm"
                                                    disabled={candidate.status !== "Completed"}
                                                    onClick={() => navigate(`/summary/${candidate._id}`)}
                                                    className="rounded-xl font-bold bg-white/5 hover:bg-primary text-foreground hover:text-white transition-all gap-2"
                                                >
                                                    <FileText className="h-4 w-4" /> View Summary
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
