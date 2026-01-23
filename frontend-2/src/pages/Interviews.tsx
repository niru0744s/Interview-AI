import { useState } from "react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AnalyticsDashboard from "../components/AnalyticsDashboard";
import { LayoutDashboard, History, Plus } from "lucide-react";
import { useInterviews, type Interview } from "../hooks/useInterviews";
import InterviewConfigDialog from "../components/interviews/InterviewConfigDialog";
import InterviewHistoryList from "../components/interviews/InterviewHistoryList";

export default function Interviews() {
  const { interviews, loading, creating, startInterview } = useInterviews();
  const [isSettingUp, setIsSettingUp] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"history" | "insights">("history");

  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLaunchInterview = async (payload: { role: string; topic: string; totalQuestions: number }) => {
    try {
      const interviewId = await startInterview(payload);
      navigate(`/interview/${interviewId}`);
    } catch {
      alert("Failed to start interview");
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
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight">Success Dashboard</h1>
          <p className="text-muted-foreground text-lg">Your journey to the dream job starts here.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex bg-muted p-1 rounded-lg mr-2">
            <Button
              variant={activeTab === "history" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("history")}
              className="gap-2"
            >
              <History className="h-4 w-4" /> History
            </Button>
            <Button
              variant={activeTab === "insights" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("insights")}
              className="gap-2"
            >
              <LayoutDashboard className="h-4 w-4" /> Insights
            </Button>
          </div>

          <Button variant="outline" size="sm" onClick={logout} className="font-semibold h-9">
            Logout
          </Button>

          <Button onClick={() => setIsSettingUp(true)} size="sm" className="font-bold px-4 shadow-md h-9 gap-2">
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
