import { Card, CardContent } from "../ui/card";
import { Star, MessageSquare, ShieldCheck, Zap, BrainCircuit } from "lucide-react";
import { cn } from "../../lib/utils";

type Answer = {
    _id: string;
    question: string;
    answer: string;
    score: number;
    strengths: string[];
    missing_points: string[];
    ideal_answer: string;
};

interface ReviewAnswerCardProps {
    answer: Answer;
    index: number;
}

export default function ReviewAnswerCard({ answer, index }: ReviewAnswerCardProps) {
    return (
        <Card className="glass-card border-white/5 overflow-hidden group">
            <div className="bg-muted/30 p-4 px-6 border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <span className="h-6 w-6 rounded-full bg-background flex items-center justify-center text-[10px] font-black border border-white/10">
                        {index + 1}
                    </span>
                    <span className="font-black text-xs uppercase tracking-widest text-muted-foreground/60">
                        Technical Query
                    </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-background/50 border border-white/10">
                    <Star className={cn("h-4 w-4", answer.score >= 7 ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground")} />
                    <span className="font-black text-sm">{answer.score}<span className="text-muted-foreground/50 text-[10px]">/10</span></span>
                </div>
            </div>
            <CardContent className="p-8 space-y-8">
                <div className="space-y-3">
                    <h3 className="font-black text-2xl leading-tight group-hover:text-primary transition-colors">{answer.question}</h3>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] flex items-center gap-2">
                                <MessageSquare className="h-3 w-3" /> Candidate Trace
                            </p>
                            <div className="p-5 rounded-2xl bg-muted/40 text-sm font-medium italic border border-dashed border-white/10 text-foreground/80 leading-relaxed shadow-inner">
                                "{answer.answer}"
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            {answer.strengths.length > 0 && (
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black uppercase text-green-500 tracking-[0.2em] flex items-center gap-2">
                                        <ShieldCheck className="h-3 w-3" /> Points Scored
                                    </p>
                                    <ul className="space-y-2">
                                        {answer.strengths.map((s, i) => (
                                            <li key={i} className="flex items-start gap-2 text-xs font-bold leading-relaxed text-foreground/70">
                                                <span className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5 shrink-0 shadow-[0_0_5px_oklch(var(--color-green-500)/0.5)]" />
                                                {s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {answer.missing_points.length > 0 && (
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black uppercase text-orange-400 tracking-[0.2em] flex items-center gap-2">
                                        <Zap className="h-3 w-3" /> Growth Delta
                                    </p>
                                    <ul className="space-y-2">
                                        {answer.missing_points.map((m, i) => (
                                            <li key={i} className="flex items-start gap-2 text-xs font-bold leading-relaxed text-foreground/70">
                                                <span className="h-1.5 w-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                                                {m}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p className="text-[10px] font-black uppercase text-primary tracking-[0.2em] flex items-center gap-2">
                            <BrainCircuit className="h-3 w-3" /> AI Benchmark Answer
                        </p>
                        <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-sm font-medium leading-relaxed whitespace-pre-wrap shadow-inner">
                            {answer.ideal_answer}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
