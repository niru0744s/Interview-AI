import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Loader2, BrainCircuit, Send, Terminal, FastForward } from "lucide-react";
import InterviewQuitDialog from "./InterviewQuitDialog";
import { cn } from "../../lib/utils";

interface InterviewLiveAreaProps {
    loading: boolean;
    optimisticAnswer: string | null;
    question: string | undefined;
    answer: string;
    setAnswer: (val: string) => void;
    submitting: boolean;
    skipping?: boolean;
    canSubmit: boolean;
    onSubmit: () => Promise<void>;
    onSkip: () => Promise<void>;
    onQuit: () => Promise<void>;
}

export default function InterviewLiveArea({
    loading,
    optimisticAnswer,
    question,
    answer,
    setAnswer,
    submitting,
    skipping,
    canSubmit,
    onSubmit,
    onSkip,
    onQuit,
}: InterviewLiveAreaProps) {
    if (loading || optimisticAnswer) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-8 animate-in fade-in duration-500">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                    <div className="relative bg-card glass border-2 border-primary/20 p-6 rounded-full glow-primary">
                        <BrainCircuit className="h-12 w-12 text-primary animate-bounce" />
                    </div>
                </div>
                <div className="text-center space-y-2">
                    <p className="text-2xl font-black tracking-tight">
                        {optimisticAnswer ? "Analyzing Experience..." : "Synthesizing Question..."}
                    </p>
                    <p className="text-muted-foreground font-medium animate-pulse">
                        Our AI is processing your technical input
                    </p>
                </div>

                {optimisticAnswer && (
                    <div className="mt-4 p-6 glass-card border-white/5 max-w-md w-full opacity-60 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2"><Terminal className="h-4 w-4 text-muted-foreground/30" /></div>
                        <p className="text-xs uppercase font-black text-primary mb-3 tracking-widest">Submitted Log</p>
                        <p className="italic text-sm leading-relaxed line-clamp-4">{optimisticAnswer}</p>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000" />
                <div className="relative glass-card p-10 border-white/10 group-hover:border-primary/20 transition-colors">
                    <div className="absolute top-4 left-6 flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary glow-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Engine Output</span>
                    </div>
                    <p className="text-2xl font-bold leading-relaxed text-foreground/90 pt-4">
                        {question || "Standing by for engine input..."}
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-center px-2">
                    <label className="text-sm font-black uppercase tracking-widest text-muted-foreground/60">Your Technical Response</label>
                    <span className={cn("text-xs font-bold", answer.length > 500 ? "text-orange-500" : "text-muted-foreground/40")}>
                        {answer.length} characters
                    </span>
                </div>
                <Textarea
                    placeholder="Type your response here... Be detailed and technical."
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    rows={7}
                    className="text-lg p-6 glass-card bg-background/40 focus:ring-primary/20 border-white/10 resize-none transition-all duration-300"
                    disabled={submitting}
                />
            </div>

            <div className="flex justify-between items-center pt-4">
                <InterviewQuitDialog onQuit={onQuit} />

                <div className="flex gap-4">
                    <Button
                        variant="ghost"
                        onClick={onSkip}
                        disabled={submitting || skipping || loading}
                        className="h-14 px-8 rounded-2xl font-black text-muted-foreground hover:text-foreground hover:bg-white/5 uppercase tracking-widest text-xs gap-2"
                    >
                        {skipping ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <>Skip Question <FastForward className="h-4 w-4" /></>
                        )}
                    </Button>

                    <Button
                        onClick={onSubmit}
                        disabled={!canSubmit}
                        size="lg"
                        className={cn(
                            "h-14 px-10 rounded-2xl font-black text-lg transition-all duration-300 shadow-xl",
                            canSubmit ? "btn-premium text-white glow-primary" : "bg-muted text-muted-foreground"
                        )}
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="mr-3 animate-spin h-5 w-5" /> Processing...
                            </>
                        ) : (
                            <>
                                Submit Answer <Send className="ml-3 h-5 w-5" />
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
