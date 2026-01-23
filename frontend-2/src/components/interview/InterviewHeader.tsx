import { Wifi, WifiOff } from "lucide-react";

interface InterviewHeaderProps {
    role: string | undefined;
    topic: string | undefined;
    currentIndex: number | undefined;
    totalQuestions: number | undefined;
    status: string;
}

export default function InterviewHeader({ role, topic, currentIndex, totalQuestions, status }: InterviewHeaderProps) {
    return (
        <div className="flex items-center justify-between pb-4 border-b">
            <div className="space-y-0.5">
                <h2 className="text-xl font-bold">{role || "Interview Session"}</h2>
                {topic && (
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                        Topic: {topic}
                    </p>
                )}
                {currentIndex && (
                    <p className="text-sm text-muted-foreground font-medium pt-1">
                        Question {currentIndex} of {totalQuestions || "..."}
                    </p>
                )}
            </div>
            <div className="flex items-center gap-2 text-sm">
                {status === "CONNECTED" ? (
                    <span className="flex items-center gap-1 text-green-600 font-semibold">
                        <Wifi size={16} /> Live
                    </span>
                ) : (
                    <span className="flex items-center gap-1 text-yellow-600 animate-pulse font-semibold">
                        <WifiOff size={16} /> {status}...
                    </span>
                )}
            </div>
        </div>
    );
}
