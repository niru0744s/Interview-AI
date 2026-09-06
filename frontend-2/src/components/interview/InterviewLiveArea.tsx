import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Loader2, BrainCircuit, Send, Terminal, FastForward, Code2, ListChecks, CheckSquare, MessageSquare } from "lucide-react";
import InterviewQuitDialog from "./InterviewQuitDialog";
import MCQAnswerArea from "./MCQAnswerArea";
import MultiChoiceAnswerArea from "./MultiChoiceAnswerArea";
import CodingAnswerArea from "./CodingAnswerArea";
import { cn } from "../../lib/utils";

interface InterviewLiveAreaProps {
    loading: boolean;
    optimisticAnswer: string | null;
    question: string | undefined;
    questionType?: "conceptual" | "mcq" | "multi_choice" | "code";
    options?: string[];
    codeTemplate?: string | null;
    language?: string | null;
    answer: string;
    setAnswer: (val: string) => void;
    selectedOptions?: string[];
    setSelectedOptions?: (opts: string[] | ((prev: string[]) => string[])) => void;
    code?: string;
    setCode?: (val: string) => void;
    selectedLanguage?: string;
    setSelectedLanguage?: (lang: string) => void;
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
    questionType = "conceptual",
    options = [],
    codeTemplate,
    language,
    answer,
    setAnswer,
    selectedOptions = [],
    setSelectedOptions,
    code = "",
    setCode,
    selectedLanguage = "javascript",
    setSelectedLanguage,
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
                        {optimisticAnswer ? "Evaluating Submission..." : "Synthesizing Question..."}
                    </p>
                    <p className="text-muted-foreground font-medium animate-pulse">
                        {questionType === "code"
                            ? "AI is reviewing your code structure, edge cases & logic"
                            : "Our AI is processing your technical input"}
                    </p>
                </div>

                {optimisticAnswer && (
                    <div className="mt-4 p-6 glass-card border-white/5 max-w-xl w-full opacity-70 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2"><Terminal className="h-4 w-4 text-muted-foreground/30" /></div>
                        <p className="text-xs uppercase font-black text-primary mb-3 tracking-widest flex items-center gap-2">
                            <span>Submitted Response</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 font-mono uppercase">
                                {questionType}
                            </span>
                        </p>
                        <p className="italic text-sm leading-relaxed line-clamp-6 font-mono whitespace-pre-wrap">
                            {optimisticAnswer}
                        </p>
                    </div>
                )}
            </div>
        );
    }

    // Question format badge helper
    const renderFormatBadge = () => {
        switch (questionType) {
            case "mcq":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        <ListChecks className="h-3.5 w-3.5" /> Multiple Choice
                    </span>
                );
            case "multi_choice":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        <CheckSquare className="h-3.5 w-3.5" /> Multi-Select
                    </span>
                );
            case "code":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <Code2 className="h-3.5 w-3.5" /> Coding Task
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                        <MessageSquare className="h-3.5 w-3.5" /> Conceptual
                    </span>
                );
        }
    };

    // Toggle option for multi-choice
    const handleToggleOption = (option: string) => {
        if (!setSelectedOptions) return;
        setSelectedOptions((prev) =>
            prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
        );
    };

    // Division 4: Split-Screen layout for Coding tasks
    if (questionType === "code") {
        return (
            <div className="grid lg:grid-cols-12 gap-6 items-start animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Left Column: Problem & Instructions */}
                <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-6">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-primary/20 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000" />
                        <div className="relative glass-card p-6 sm:p-8 border-white/10 group-hover:border-primary/20 transition-colors space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-emerald-400 glow-primary" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Coding Task</span>
                                </div>
                                {renderFormatBadge()}
                            </div>
                            <div className="text-base sm:text-lg font-semibold leading-relaxed text-foreground/90 whitespace-pre-wrap">
                                {question || "Standing by for engine input..."}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-1">
                        <InterviewQuitDialog onQuit={onQuit} />
                        <Button
                            variant="ghost"
                            onClick={onSkip}
                            disabled={submitting || skipping || loading}
                            className="h-11 px-4 rounded-xl font-bold text-muted-foreground hover:text-foreground hover:bg-white/5 uppercase tracking-wider text-xs gap-1.5"
                        >
                            {skipping ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>Skip Question <FastForward className="h-3.5 w-3.5" /></>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Right Column: Code Editor & Submission */}
                <div className="lg:col-span-7 space-y-4">
                    <CodingAnswerArea
                        code={code}
                        onChange={setCode || (() => {})}
                        language={selectedLanguage || language || "javascript"}
                        onLanguageChange={setSelectedLanguage}
                        starterCode={codeTemplate}
                        disabled={submitting}
                    />

                    <div className="flex justify-end pt-2">
                        <Button
                            onClick={onSubmit}
                            disabled={!canSubmit}
                            size="lg"
                            className={cn(
                                "h-14 px-8 rounded-2xl font-black text-base transition-all duration-300 shadow-xl",
                                canSubmit ? "btn-premium text-white glow-primary" : "bg-muted text-muted-foreground"
                            )}
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-3 animate-spin h-5 w-5" /> Processing...
                                </>
                            ) : (
                                <>
                                    Submit Code Solution <Send className="ml-3 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Default Centered Layout for Conceptual, MCQ, MultiChoice
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Question Box */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000" />
                <div className="relative glass-card p-8 sm:p-10 border-white/10 group-hover:border-primary/20 transition-colors space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-primary glow-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Engine Output</span>
                        </div>
                        {renderFormatBadge()}
                    </div>
                    <p className="text-xl sm:text-2xl font-bold leading-relaxed text-foreground/90 whitespace-pre-wrap">
                        {question || "Standing by for engine input..."}
                    </p>
                </div>
            </div>

            {/* Answer Input Section Based on Question Type */}
            {questionType === "mcq" && (
                <MCQAnswerArea
                    options={options}
                    selectedOption={selectedOptions[0] || ""}
                    onSelect={(opt) => setSelectedOptions && setSelectedOptions([opt])}
                    disabled={submitting}
                />
            )}

            {questionType === "multi_choice" && (
                <MultiChoiceAnswerArea
                    options={options}
                    selectedOptions={selectedOptions}
                    onToggle={handleToggleOption}
                    disabled={submitting}
                />
            )}

            {(!questionType || questionType === "conceptual") && (
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
            )}

            {/* Actions Bar */}
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
