import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";

interface ReviewSummaryHeaderProps {
    score: number;
    totalQuestions: number;
    verdict: string;
    feedback: string;
}

export default function ReviewSummaryHeader({ score, totalQuestions, verdict, feedback }: ReviewSummaryHeaderProps) {
    return (
        <Card className="bg-primary/5 border-primary/20 shadow-sm">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="text-xl">Final Performance Summary</CardTitle>
                    <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full font-bold">
                        Overall: {score}/{totalQuestions * 10}
                    </div>
                </div>
                <CardDescription className="text-lg font-medium text-primary/80">
                    Verdict: {verdict}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground leading-relaxed">{feedback}</p>
            </CardContent>
        </Card>
    );
}
