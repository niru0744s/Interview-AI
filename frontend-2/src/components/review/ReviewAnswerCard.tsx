import { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Star, MessageSquare, ShieldCheck, Zap, BrainCircuit, Code2, ListChecks, CheckSquare, Copy, Check } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

export type ReviewAnswer = {
    _id: string;
    question: string;
    answer: string;
    questionType?: "conceptual" | "mcq" | "multi_choice" | "code";
    selectedOptions?: string[];
    codeAnswer?: {
        code: string;
        language: string;
    };
    score: number;
    strengths: string[];
    missing_points: string[];
    ideal_answer: string;
};

interface ReviewAnswerCardProps {
    answer: ReviewAnswer;
    index: number;
}

export default function ReviewAnswerCard({ answer, index }: ReviewAnswerCardProps) {
    const [copiedCandidate, setCopiedCandidate] = useState(false);
    const [copiedIdeal, setCopiedIdeal] = useState(false);

    const isCode = answer.questionType === "code" || Boolean(answer.codeAnswer?.code);
    const isMCQ = answer.questionType === "mcq" || answer.questionType === "multi_choice";
    const codeContent = answer.codeAnswer?.code || (isCode ? answer.answer : "");
    const codeLang = answer.codeAnswer?.language || "code";

    const handleCopy = async (text: string, setCopied: (val: boolean) => void) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // ignore
        }
    };

    const renderFormatBadge = () => {
        switch (answer.questionType) {
            case "code":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <Code2 className="h-3 w-3" /> Coding
                    </span>
                );
            case "mcq":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        <ListChecks className="h-3 w-3" /> MCQ
                    </span>
                );
            case "multi_choice":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        <CheckSquare className="h-3 w-3" /> Multi-Select
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                        <MessageSquare className="h-3 w-3" /> Conceptual
                    </span>
                );
        }
    };

    return (
        <Card className="glass-card border-white/5 overflow-hidden group">
            {/* Card Header */}
            <div className="bg-muted/30 p-4 px-6 border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <span className="h-6 w-6 rounded-full bg-background flex items-center justify-center text-[10px] font-black border border-white/10">
                        {index + 1}
                    </span>
                    <span className="font-black text-xs uppercase tracking-widest text-muted-foreground/60">
                        Query {index + 1}
                    </span>
                    {renderFormatBadge()}
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-background/50 border border-white/10">
                    <Star className={cn("h-4 w-4", answer.score >= 7 ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground")} />
                    <span className="font-black text-sm">{answer.score}<span className="text-muted-foreground/50 text-[10px]">/10</span></span>
                </div>
            </div>

            {/* Card Content */}
            <CardContent className="p-6 sm:p-8 space-y-8">
                <div className="space-y-3">
                    <h3 className="font-black text-xl sm:text-2xl leading-tight group-hover:text-primary transition-colors whitespace-pre-wrap">
                        {answer.question}
                    </h3>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left Column: Candidate Trace + Strengths/Weaknesses */}
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] flex items-center gap-2">
                                <MessageSquare className="h-3 w-3" /> Candidate Trace
                            </p>

                            {isCode ? (
                                <div className="rounded-2xl border border-white/10 bg-[#0d1117] overflow-hidden">
                                    <div className="flex items-center justify-between px-3 py-2 bg-[#161b22] border-b border-white/5 text-xs font-mono text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Code2 className="h-3.5 w-3.5 text-primary" />
                                            <span>submitted.{codeLang === "python" ? "py" : "js"}</span>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleCopy(codeContent, setCopiedCandidate)}
                                            className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground hover:bg-white/5"
                                        >
                                            {copiedCandidate ? (
                                                <><Check className="h-3 w-3 text-green-400 mr-1" /> Copied</>
                                            ) : (
                                                <><Copy className="h-3 w-3 mr-1" /> Copy</>
                                            )}
                                        </Button>
                                    </div>
                                    <pre className="p-4 text-xs font-mono text-emerald-400/90 overflow-x-auto max-h-[300px] leading-relaxed whitespace-pre">
                                        <code>{codeContent || "// No code submitted"}</code>
                                    </pre>
                                </div>
                            ) : isMCQ ? (
                                <div className="p-5 rounded-2xl bg-muted/40 border border-white/10 space-y-2">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/60 block">Selected Option(s):</span>
                                    <div className="flex flex-wrap gap-2">
                                        {(answer.selectedOptions && answer.selectedOptions.length > 0
                                            ? answer.selectedOptions
                                            : [answer.answer]
                                        ).map((opt, i) => (
                                            <span
                                                key={i}
                                                className="px-3 py-1.5 rounded-xl bg-primary/15 border border-primary/30 text-primary font-bold text-sm inline-flex items-center gap-2"
                                            >
                                                <span className="h-2 w-2 rounded-full bg-primary" />
                                                {opt}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="p-5 rounded-2xl bg-muted/40 text-sm font-medium italic border border-dashed border-white/10 text-foreground/80 leading-relaxed shadow-inner">
                                    "{answer.answer}"
                                </div>
                            )}
                        </div>

                        {/* Strengths & Missing Points */}
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

                    {/* Right Column: AI Benchmark Answer */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black uppercase text-primary tracking-[0.2em] flex items-center gap-2">
                                <BrainCircuit className="h-3 w-3" /> AI Benchmark Answer
                            </p>
                            {isCode && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCopy(answer.ideal_answer, setCopiedIdeal)}
                                    className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground hover:bg-white/5"
                                >
                                    {copiedIdeal ? (
                                        <><Check className="h-3 w-3 text-green-400 mr-1" /> Copied</>
                                    ) : (
                                        <><Copy className="h-3 w-3 mr-1" /> Copy</>
                                    )}
                                </Button>
                            )}
                        </div>
                        <div className={cn(
                            "p-6 rounded-2xl border text-sm font-medium leading-relaxed whitespace-pre-wrap shadow-inner overflow-x-auto",
                            isCode
                                ? "bg-[#0d1117] border-white/10 font-mono text-xs text-sky-300/90 max-h-[460px]"
                                : "bg-primary/5 border-primary/10 text-foreground/90"
                        )}>
                            {answer.ideal_answer}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
