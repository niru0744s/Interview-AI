import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { cn } from "../../lib/utils";
import { type Interview } from "../../hooks/useInterviews";

interface InterviewHistoryListProps {
    interviews: Interview[];
    onAction: (interview: Interview) => void;
    onStartNew: () => void;
}

export default function InterviewHistoryList({ interviews, onAction, onStartNew }: InterviewHistoryListProps) {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
                Recent Activity
                <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {interviews.length} sessions
                </span>
            </h2>

            {interviews.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                    {interviews.map((interview, index) => (
                        <Card
                            key={interview._id}
                            className="group hover:border-primary transition-all cursor-pointer"
                            onClick={() => onAction(interview)}
                        >
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg">
                                        {interview.role || `Interview #${index + 1}`}
                                    </CardTitle>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <span className={cn(
                                            "h-2.5 w-2.5 rounded-full",
                                            interview.status === "in_progress" ? "bg-yellow-400 animate-pulse" :
                                                interview.status === "Completed" ? "bg-green-500" : "bg-red-400"
                                        )} />
                                        {interview.status.replace("_", " ")}
                                    </div>
                                </div>
                                <Button variant="ghost" className="group-hover:translate-x-1 transition-transform">
                                    {interview.status === "in_progress" ? "Resume →" : "Review →"}
                                </Button>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="border-dashed py-12 text-center">
                    <CardContent className="space-y-2">
                        <p className="text-lg font-medium">No interview history yet</p>
                        <p className="text-muted-foreground">Kickstart your preparation by launching your first AI session.</p>
                        <Button variant="link" onClick={onStartNew} className="mt-4">
                            Configure your first session
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
