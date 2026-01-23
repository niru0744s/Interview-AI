import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Loader2 } from "lucide-react";
import InterviewQuitDialog from "./InterviewQuitDialog";

interface InterviewLiveAreaProps {
    loading: boolean;
    optimisticAnswer: string | null;
    question: string | undefined;
    answer: string;
    setAnswer: (val: string) => void;
    submitting: boolean;
    canSubmit: boolean;
    onSubmit: () => Promise<void>;
    onQuit: () => Promise<void>;
}

export default function InterviewLiveArea({
    loading,
    optimisticAnswer,
    question,
    answer,
    setAnswer,
    submitting,
    canSubmit,
    onSubmit,
    onQuit,
}: InterviewLiveAreaProps) {
    if (loading || optimisticAnswer) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
                <Loader2 className="animate-spin h-8 w-8" />
                <p>{optimisticAnswer ? "Analyzing your answer..." : "The AI is thinking of your next question..."}</p>
                {optimisticAnswer && (
                    <div className="mt-8 p-4 border rounded-md bg-muted/50 max-w-md w-full opacity-60">
                        <p className="text-xs uppercase font-bold mb-2">Your Answer (Pending):</p>
                        <p className="italic text-sm line-clamp-3">{optimisticAnswer}</p>
                    </div>
                )}
            </div>
        );
    }

    return (
        <>
            <div className="border rounded-lg bg-card p-6 shadow-sm">
                <p className="text-lg leading-relaxed whitespace-pre-wrap">
                    {question || "Waiting for question..."}
                </p>
            </div>

            <Textarea
                placeholder="Type your answer here..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={6}
                className="text-base p-4"
                disabled={submitting}
            />

            <div className="flex justify-between items-center pt-4">
                <InterviewQuitDialog onQuit={onQuit} />

                <Button
                    onClick={onSubmit}
                    disabled={!canSubmit}
                    size="lg"
                >
                    {submitting ? (
                        <>
                            <Loader2 className="mr-2 animate-spin" /> Processing...
                        </>
                    ) : (
                        "Submit Answer"
                    )}
                </Button>
            </div>
        </>
    );
}
