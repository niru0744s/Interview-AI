import { useRouteError, useNavigate, useLocation, Navigate } from "react-router-dom";
import { Button } from "./ui/button";
import { useAuth } from "../context/AuthContext";
import { AlertCircle, Home, ArrowLeft, Rocket } from "lucide-react";

const RouteError = () => {
  const error = useRouteError();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();

  console.error("Route error:", error);

  // If not logged in and trying to access an internal route that errored, 
  // it's better to just redirect to login
  const isInternalPath = location.pathname.startsWith("/interviews") ||
    location.pathname.startsWith("/interview") ||
    location.pathname.startsWith("/summary") ||
    location.pathname.startsWith("/review");

  if (!loading && !user && isInternalPath) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      <div className="max-w-md w-full text-center space-y-8 glass p-12 rounded-[2rem] border-white/10 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-destructive/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 scale-110 rotate-3 group">
          <AlertCircle className="h-10 w-10 text-destructive animate-bounce" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-gradient">Oops! Lost in Space?</h1>
          <p className="text-muted-foreground font-medium text-lg leading-relaxed">
            We couldn't handle that request. The path might be broken or you don't have access.
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <Button
            size="lg"
            onClick={() => navigate(user ? "/interviews" : "/")}
            className="btn-premium h-14 rounded-2xl font-black text-sm uppercase tracking-widest text-white glow-primary gap-2"
          >
            {user ? <LayoutDashboard className="h-4 w-4" /> : <Home className="h-4 w-4" />}
            {user ? "Back to Dashboard" : "Go to Landing"}
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onClick={() => navigate(-1)}
            className="h-14 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-white/5 border border-white/5 gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Go Back
          </Button>
        </div>

        <div className="pt-8 flex items-center justify-center gap-2 opacity-20 grayscale">
          <Rocket className="h-4 w-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Interview AI System</span>
        </div>
      </div>
    </div>
  );
};

// Simple LayoutDashboard icon mock if not imported correctly
const LayoutDashboard = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24" height="24" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className={className}
  >
    <rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" />
  </svg>
);

export default RouteError;
