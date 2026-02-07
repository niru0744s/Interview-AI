import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ReactNode } from "react";

type ProtectedRouteProps = {
    children: ReactNode;
    role?: "candidate" | "recruiter";
};

export default function ProtectedRoute({ children, role }: ProtectedRouteProps) {
    const { user, loading } = useAuth();

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Synchronizing Workspace...</p>
            </div>
        </div>
    );

    if (!user) return <Navigate to="/login" replace />;

    // Role-based protection
    if (role && user.role !== role) {
        console.warn(`Role mismatch: expected ${role}, got ${user.role}. Redirecting...`);
        return <Navigate to={user.role === "recruiter" ? "/recruiter" : "/interviews"} replace />;
    }

    return children;
}