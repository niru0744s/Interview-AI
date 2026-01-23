import { Card, CardContent } from "../ui/card";
import { Star, CheckCircle2, Info } from "lucide-react";

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
        <Card className="overflow-hidden border-2 hover:border-primary/30 transition-colors">
            <div className="bg-muted/30 p-4 border-b flex justify-between items-center">
                <span className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
                    Question {index + 1}
                </span>
                <div className="flex items-center gap-2">
                    <Star className={`h-4 w-4 ${answer.score >= 7 ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`} />
                    <span className="font-bold">{answer.score}/10</span>
                </div>
            </div>
            <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                    <h3 className="font-bold text-lg leading-snug">{answer.question}</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <p className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1">
                                Your Answer
                            </p>
                            <div className="p-4 rounded-lg bg-muted/50 text-sm italic border border-dashed text-foreground/80">
                                "{answer.answer}"
                            </div>
                        </div>

                        <div className="space-y-3">
                            {answer.strengths.length > 0 && (
                                <div className="space-y-1.5">
                                    <p className="text-xs font-bold uppercase text-green-600 flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3" /> Strengths
                                    </p>
                                    <ul className="text-sm space-y-1">
                                        {answer.strengths.map((s, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <span className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                                                {s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {answer.missing_points.length > 0 && (
                                <div className="space-y-1.5">
                                    <p className="text-xs font-bold uppercase text-orange-600 flex items-center gap-1">
                                        <Info className="h-3 w-3" /> Missing Points
                                    </p>
                                    <ul className="text-sm space-y-1">
                                        {answer.missing_points.map((m, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <span className="h-1.5 w-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                                                {m}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-xs font-bold uppercase text-primary flex items-center gap-1">
                            Ideal AI Answer
                        </p>
                        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-sm leading-relaxed whitespace-pre-wrap">
                            {answer.ideal_answer}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
