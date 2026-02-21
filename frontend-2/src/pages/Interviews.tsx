import { useState } from "react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import AnalyticsDashboard from "../components/AnalyticsDashboard";
import { LayoutDashboard, History, Plus } from "lucide-react";
import { cn } from "../lib/utils";
import { useInterviews, type Interview } from "../hooks/useInterviews";
import InterviewConfigDialog from "../components/interviews/InterviewConfigDialog";
import InterviewHistoryList from "../components/interviews/InterviewHistoryList";
import { toast } from "sonner";

export default function Interviews() {
  const { interviews, loading, creating, startInterview } = useInterviews();
  const [isSettingUp, setIsSettingUp] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"history" | "insights">("history");

  const navigate = useNavigate();

  const handleLaunchInterview = async (payload: {
    role: string;
    topic: string;
    totalQuestions: number;
    resumeFile: File | null;
    resumeText: string;
  }) => {
    try {
      const formData = new FormData();
      formData.append("role", payload.role);
      formData.append("topic", payload.topic);
      formData.append("totalQuestions", payload.totalQuestions.toString());

      if (payload.resumeFile) {
        formData.append("resumeFile", payload.resumeFile);
      } else if (payload.resumeText) {
        formData.append("resumeText", payload.resumeText);
      }

      if (payload.resumeFile) {
        toast.info("AI is reading and parsing your resume... This may take a few seconds.");
      } else {
        toast.info("AI is preparing your interview environment...");
      }

      const interviewId = await startInterview(formData);
      toast.success("AI is ready! Launching your session...");
      navigate(`/interview/${interviewId}`);
    } catch {
      toast.error("Failed to start interview. Please try again.");
    }
  };

  const handleAction = (interview: Interview): void => {
    if (interview.status === "in_progress") {
      navigate(`/interview/${interview._id}`);
    } else {
      navigate(`/review/${interview._id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-muted-foreground animate-pulse font-medium">Loading your journey...</div>
      </div>
    );
  }

  if (isSettingUp) {
    return (
      <InterviewConfigDialog
        onCancel={() => setIsSettingUp(false)}
        onLaunch={handleLaunchInterview}
        isCreating={creating}
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-12 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/10 pb-8">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gradient">Success Dashboard</h1>
          <p className="text-muted-foreground text-xl font-medium">Your journey to the dream job starts here.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex glass p-1.5 rounded-2xl">
            <Button
              variant={activeTab === "history" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("history")}
              className={cn(
                "gap-2 px-6 rounded-xl transition-all duration-300",
                activeTab === "history" && "btn-premium text-white shadow-lg"
              )}
            >
              <History className="h-4 w-4" /> History
            </Button>
            <Button
              variant={activeTab === "insights" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("insights")}
              className={cn(
                "gap-2 px-6 rounded-xl transition-all duration-300",
                activeTab === "insights" && "btn-premium text-white shadow-lg"
              )}
            >
              <LayoutDashboard className="h-4 w-4" /> Insights
            </Button>
          </div>

          <Button onClick={() => setIsSettingUp(true)} size="sm" className="btn-premium text-white font-black px-6 shadow-xl h-11 gap-2 rounded-xl glow-primary">
            <Plus className="h-4 w-4" /> New Session
          </Button>
        </div>

      </div>

      {activeTab === "insights" ? (
        <AnalyticsDashboard />
      ) : (
        <InterviewHistoryList
          interviews={interviews}
          onAction={handleAction}
          onStartNew={() => setIsSettingUp(true)}
        />
      )}
    </div>
  );
}
