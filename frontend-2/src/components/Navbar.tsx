import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { useAuth } from "../context/AuthContext";
import { Rocket, LogOut, LayoutDashboard, Briefcase } from "lucide-react";
import { toast } from "sonner";

export default function Navbar() {
    const { user, logout, login } = useAuth(); // Destructuring login to use for the dev toggle
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        toast.info("Logged out successfully. See you soon!");
    }

    // Temporary developer helper to switch roles for testing
    const switchRole = () => {
        if (!user) return;
        const newRole = user.role === "candidate" ? "recruiter" : "candidate";
        login(user.token, newRole);
        toast.success(`Switched to ${newRole} mode!`);
        navigate(newRole === "recruiter" ? "/recruiter" : "/interviews");
    }

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-white/5 glass bg-background/60 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <Link to={user?.role === "recruiter" ? "/recruiter" : "/interviews"} className="flex items-center gap-2 group">
                    <div className="bg-primary/20 p-2 rounded-xl group-hover:scale-110 transition-transform duration-300">
                        <Rocket className="h-6 w-6 text-primary glow-primary" />
                    </div>
                    <span className="text-2xl font-black tracking-tighter text-gradient leading-none">
                        Interview AI
                    </span>
                </Link>

                <div className="flex items-center gap-6">
                    {user ? (
                        <div className="flex items-center gap-4">
                            {user.role === "recruiter" ? (
                                <Link to="/recruiter" className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                    <Briefcase className="h-4 w-4" />
                                    <span className="hidden md:inline">Recruiter</span>
                                </Link>
                            ) : (
                                <Link to="/interviews" className="text-sm font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                                    <LayoutDashboard className="h-4 w-4" />
                                    <span className="hidden md:inline">Dashboard</span>
                                </Link>
                            )}

                            <div className="h-8 w-[1px] bg-white/10 hidden md:block" />

                            <div className="flex items-center gap-3 bg-white/5 py-1.5 pl-4 pr-1.5 rounded-full border border-white/5">
                                <button
                                    onClick={switchRole}
                                    className="text-right hidden sm:block hover:opacity-70 transition-opacity"
                                >
                                    <p className="text-[10px] font-black leading-none uppercase tracking-tighter text-primary mb-0.5">{user.role}</p>
                                    <p className="text-[8px] font-bold leading-none text-muted-foreground">Switch</p>
                                </button>


                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={handleLogout}
                                    className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive transition-all"
                                >
                                    <LogOut className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" onClick={() => navigate("/login")} className="font-bold uppercase tracking-widest text-xs">
                                Login
                            </Button>
                            <Button onClick={() => navigate("/signup")} className="btn-premium text-white font-black px-6 shadow-xl h-10 rounded-xl glow-primary text-xs uppercase tracking-widest">
                                Get Started
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
