import { WifiOff, Layout } from "lucide-react";

interface InterviewHeaderProps {
    role: string | undefined;
    topic: string | undefined;
    currentIndex: number | undefined;
    totalQuestions: number | undefined;
    status: string;
}

export default function InterviewHeader({ role, topic, currentIndex, totalQuestions, status }: InterviewHeaderProps) {
    const progress = totalQuestions ? ((currentIndex || 0) / totalQuestions) * 100 : 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded-lg">
                            <Layout className="h-5 w-5 text-primary" />
                        </div>
                        <h2 className="text-2xl font-black tracking-tight">{role || "Practice Session"}</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        {topic && (
                            <span className="text-xs font-black text-primary bg-primary/10 px-2.5 py-1 rounded-md uppercase tracking-widest border border-primary/20">
                                {topic}
                            </span>
                        )}
                        <div className="flex items-center gap-2 text-sm font-bold">
                            {status === "CONNECTED" ? (
                                <span className="flex items-center gap-1.5 text-green-500">
                                    <span className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_oklch(var(--color-green-500)/0.6)] animate-pulse" />
                                    Live Connection
                                </span>
                            ) : (
                                <span className="flex items-center gap-1.5 text-yellow-500 animate-pulse">
                                    <WifiOff size={14} /> Reconnecting...
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="text-right hidden sm:block">
                    <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">Progress</p>
                    <p className="text-3xl font-black">
                        {currentIndex || 0}<span className="text-muted-foreground/30 text-xl">/{totalQuestions || "..."}</span>
                    </p>
                </div>
            </div>

            {/* Sleek Progress Bar */}
            <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden border border-white/5">
                <div
                    className="absolute top-0 left-0 h-full btn-premium transition-all duration-700 ease-out glow-primary"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}
