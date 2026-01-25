import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Award } from "lucide-react";

interface ReviewSummaryHeaderProps {
    score: number;
    totalQuestions: number;
    verdict: string;
    feedback: string;
}

export default function ReviewSummaryHeader({ score, totalQuestions, verdict, feedback }: ReviewSummaryHeaderProps) {
    const percentage = (score / (totalQuestions * 10)) * 100;

    return (
        <Card className="glass-card border-white/5 overflow-hidden">
            <CardHeader className="pb-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <div className="bg-primary/10 p-2 rounded-lg">
                                <Award className="h-5 w-5 text-primary" />
                            </div>
                            <CardTitle className="text-2xl font-black tracking-tight">Post-Interview Analysis</CardTitle>
                        </div>
                        <CardDescription className="text-lg font-bold">
                            Final Verdict: <span className="text-primary italic">{verdict}</span>
                        </CardDescription>
                    </div>
                    <div className="bg-primary text-white px-6 py-2 rounded-2xl font-black text-xl shadow-lg glow-primary">
                        Score: {score}<span className="text-white/50 text-base">/{totalQuestions * 10}</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="p-6 bg-muted/30 rounded-2xl border border-white/5 italic font-medium leading-relaxed text-foreground/80">
                    "{feedback}"
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-black uppercase tracking-widest text-muted-foreground">
                        <span>Domain Mastery</span>
                        <span>{Math.round(percentage)}%</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full btn-premium transition-all duration-1000" style={{ width: `${percentage}%` }} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
