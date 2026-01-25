import { Button } from "../ui/button";
import { Card, CardTitle, CardContent } from "../ui/card";
import { cn } from "../../lib/utils";
import { type Interview } from "../../hooks/useInterviews";
import { History, ArrowRight, PlayCircle, Eye, Calendar, Award, Rocket } from "lucide-react";

interface InterviewHistoryListProps {
    interviews: Interview[];
    onAction: (interview: Interview) => void;
    onStartNew: () => void;
}

export default function InterviewHistoryList({ interviews, onAction, onStartNew }: InterviewHistoryListProps) {
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black tracking-tight flex items-center gap-4">
                    <div className="bg-primary/10 p-2.5 rounded-2xl">
                        <History className="h-6 w-6 text-primary" />
                    </div>
                    Recent Journey
                </h2>
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 shadow-sm animate-in fade-in slide-in-from-right-4">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-5 w-5 rounded-full border-2 border-background bg-primary/20 flex items-center justify-center">
                                <Rocket className="h-2 w-2 text-primary" />
                            </div>
                        ))}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                        {interviews.length} Total Sessions
                    </span>
                </div>

            </div>

            {interviews.length > 0 ? (
                <div className="grid gap-4">
                    {interviews.map((interview, index) => (
                        <Card
                            key={interview._id}
                            className="glass-card group cursor-pointer border-white/5 overflow-hidden relative"
                            onClick={() => onAction(interview)}
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
                            <CardContent className="p-6 sm:p-8">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-start gap-6">
                                        <div className="hidden sm:flex flex-col items-center justify-center h-14 w-14 rounded-2xl bg-white/5 border border-white/10 group-hover:border-primary/20 transition-all font-black text-xl">
                                            {index + 1}
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <span className={cn(
                                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                                    interview.status === "in_progress"
                                                        ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                                        : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                                )}>
                                                    {interview.status.replace("_", " ")}
                                                </span>
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground/60">
                                                    <Calendar className="h-3 w-3" />
                                                    Session #{index + 1}
                                                </div>
                                            </div>
                                            <CardTitle className="text-2xl font-black group-hover:text-primary transition-colors leading-tight">
                                                {interview.role || "Technical Session"}
                                            </CardTitle>
                                            <p className="text-sm font-medium text-muted-foreground/80 flex items-center gap-2">
                                                <Award className="h-4 w-4 text-primary" />
                                                Core Evaluation Plan • {interview.totalQuestions || 10} Critical Questions
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-white/5 pt-6 md:pt-0">
                                        <div className="flex items-center gap-8 md:px-8">
                                            <div className="text-center">
                                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Status</p>
                                                <div className="h-2 w-12 bg-muted rounded-full overflow-hidden mx-auto">
                                                    <div
                                                        className={cn(
                                                            "h-full transition-all duration-1000",
                                                            interview.status === "in_progress" ? "bg-amber-500 w-1/2 animate-pulse" : "bg-emerald-500 w-full"
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            className={cn(
                                                "h-14 px-8 rounded-2xl font-black uppercase tracking-widest gap-3 transition-all duration-300 shadow-xl",
                                                interview.status === "in_progress"
                                                    ? "btn-premium text-white glow-primary"
                                                    : "glass border-white/10 hover:bg-white/5"
                                            )}
                                        >
                                            {interview.status === "in_progress" ? (
                                                <><PlayCircle className="h-5 w-5" /> RE-ENTER</>
                                            ) : (
                                                <><Eye className="h-5 w-5" /> REVEAL</>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="border-dashed border-2 py-20 text-center glass bg-transparent rounded-3xl">
                    <CardContent className="space-y-4">
                        <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                            <History className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                        <p className="text-2xl font-bold">No history yet</p>
                        <p className="text-muted-foreground max-w-xs mx-auto text-lg leading-relaxed">
                            Launch your first AI session and start tracking your success.
                        </p>
                        <Button variant="link" onClick={onStartNew} className="mt-4 text-primary font-bold text-lg group">
                            Configure session <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
