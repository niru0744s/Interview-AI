import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Rocket, Briefcase, ChevronRight, AlertCircle, Loader2 } from "lucide-react";
import axios from "axios";
import api from "../lib/axios";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

interface Template {
    _id: string;
    title: string;
    role: string;
    topic: string;
    description?: string;
    totalQuestions: number;
    difficulty: string;
}

export default function InvitePage() {
    const { code } = useParams<{ code: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [template, setTemplate] = useState<Template | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isJoining, setIsJoining] = useState(false);

    useEffect(() => {
        const fetchTemplate = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/templates/invite/${code}`);
                setTemplate(res.data);
            } catch (err: unknown) {
                if (axios.isAxiosError(err)) {
                    setError(err.response?.data?.error || "Invalid invitation link");
                } else {
                    setError("An unexpected error occurred");
                }
            } finally {
                setLoading(false);
            }
        };

        if (code) {
            fetchTemplate();
        }
    }, [code]);

    const handleJoin = async () => {
        if (!user) {
            toast.error("Please login to join the interview");
            navigate("/login", { state: { from: `/invite/${code}` } });
            return;
        }

        if (!template) return;

        try {
            setIsJoining(true);
            const res = await api.post("/interview/start", {
                role: template.role,
                topic: template.topic,
                totalQuestions: template.totalQuestions,
                difficulty: template.difficulty,
                templateId: template._id
            });

            toast.success("Interview session initialized!");
            navigate(`/interview/${res.data.interviewId}`);
        } catch {
            toast.error("Failed to join interview session");
        } finally {
            setIsJoining(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="font-bold uppercase tracking-widest text-xs text-muted-foreground">Fetching Invitation Details...</p>
            </div>
        );
    }

    if (error || !template) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center p-6">
                <Card className="glass-card border-white/10 w-full max-w-md p-10 text-center space-y-6">
                    <div className="bg-destructive/10 p-6 rounded-full inline-block mx-auto">
                        <AlertCircle className="h-12 w-12 text-destructive" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black">Invitation Error</h1>
                        <p className="text-muted-foreground font-medium">{error || "Template not found"}</p>
                    </div>
                    <Button onClick={() => navigate("/")} className="w-full h-12 rounded-xl font-black uppercase tracking-widest">
                        Back Home
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-6 bg-background pt-24">
            <div className="max-w-2xl w-full grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

                <div className="space-y-6 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                        <Rocket className="h-3 w-3" /> AI Screening Session
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-gradient leading-none">
                        Ready to Shine?
                    </h1>
                    <p className="text-muted-foreground font-medium text-lg leading-relaxed">
                        You've been invited to take an AI-powered screening interview for the <span className="text-foreground font-bold">{template.title}</span> position.
                    </p>

                    <div className="flex flex-col gap-4 pt-4">
                        <div className="flex items-center gap-3 text-sm font-bold bg-white/5 p-4 rounded-2xl border border-white/5">
                            <div className="bg-primary/20 p-2 rounded-lg">
                                <Briefcase className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-none mb-1">Position</p>
                                <p>{template.role}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <Card className="glass-card border-white/10 shadow-2xl overflow-hidden rounded-[2.5rem]">
                    <CardHeader className="p-8 pb-0 text-center">
                        <CardTitle className="text-2xl font-black">Join Interview</CardTitle>
                        <CardDescription>Structured session via invite code <span className="text-primary font-bold">#{code}</span></CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10 space-y-4 text-center">
                            <p className="text-sm font-medium text-muted-foreground italic">
                                "{template.description || "In this session, our AI will evaluate your skills and practical knowledge for this role."}"
                            </p>
                        </div>

                        <div className="space-y-4">
                            <Button
                                onClick={handleJoin}
                                disabled={isJoining}
                                className="w-full h-14 rounded-2xl btn-premium text-white font-black uppercase tracking-widest text-sm glow-primary"
                            >
                                {isJoining ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>Start AI Interview <ChevronRight className="h-5 w-5 ml-1" /></>
                                )}
                            </Button>

                            {!user && (
                                <p className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                    Account required to save progress
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
