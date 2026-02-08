import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import api from "../lib/axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, Loader2, ArrowRight, Check, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "../lib/utils";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Password Strength State
    const [strength, setStrength] = useState(0);
    const [requirements, setRequirements] = useState({
        length: false,
        upper: false,
        number: false,
        special: false
    });

    const checkStrength = (pass: string) => {
        let score = 0;
        const reqs = {
            length: pass.length >= 8,
            upper: /[A-Z]/.test(pass),
            number: /[0-9]/.test(pass),
            special: /[^A-Za-z0-9]/.test(pass)
        };

        if (reqs.length) score += 25;
        if (reqs.upper) score += 25;
        if (reqs.number) score += 25;
        if (reqs.special) score += 25;

        setStrength(score);
        setRequirements(reqs);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (strength < 100) {
            setError("Password is too weak. Please meet all requirements.");
            toast.warning("Password is too weak.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            toast.warning("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            await api.post("/auth/reset-password", { token, password });
            toast.success("Password reset successfully!");
            navigate("/login");
        } catch (err: any) {
            const msg = err.response?.data?.error || "Reset failed. Link may be expired.";
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-background">
                <Card className="max-w-md w-full border-destructive/20 bg-destructive/5">
                    <CardContent className="flex flex-col items-center p-6 text-center space-y-4">
                        <div className="p-3 bg-destructive/10 rounded-full text-destructive">
                            <X className="h-6 w-6" />
                        </div>
                        <h2 className="text-xl font-bold text-destructive">Invalid Link</h2>
                        <p className="text-muted-foreground">This password reset link is invalid or has expired.</p>
                        <Button onClick={() => navigate("/forgot-password")} variant="outline">
                            Request New Link
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px] animate-pulse" />
            </div>

            <Card className="max-w-md w-full glass-card border-white/10 shadow-2xl">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-black tracking-tight">Reset Password</CardTitle>
                    <CardDescription>Enter your new password below.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm font-bold p-4 rounded-xl flex items-center gap-3 animate-in shake duration-300">
                                <span className="text-lg">⚠️</span>
                                {error}
                            </div>
                        )}

                        <div className="relative group/field">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within/field:text-primary transition-colors" />
                            <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="New Password"
                                value={password}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setPassword(val);
                                    checkStrength(val);
                                }}
                                className="pl-12 pr-12 h-12 rounded-xl bg-background/50 border-white/10 focus:ring-primary/20 transition-all font-medium"
                                required
                                minLength={8}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>

                        {/* Password Strength Meter */}
                        <div className="space-y-3 p-4 rounded-xl bg-white/5 border border-white/5">
                            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                <span>Strength</span>
                                <span className={cn(
                                    strength <= 40 ? "text-red-500" : strength <= 80 ? "text-yellow-500" : "text-green-500"
                                )}>
                                    {strength <= 40 ? "Weak" : strength <= 80 ? "Medium" : "Strong"}
                                </span>
                            </div>
                            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className={cn("h-full transition-all duration-500 ease-out",
                                        strength <= 40 ? "bg-red-500" : strength <= 80 ? "bg-yellow-500" : "bg-green-500"
                                    )}
                                    style={{ width: `${strength}%` }}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { label: "8+ Characters", met: requirements.length },
                                    { label: "Uppercase", met: requirements.upper },
                                    { label: "Number", met: requirements.number },
                                    { label: "Special Char", met: requirements.special },
                                ].map((req, i) => (
                                    <div key={i} className={cn("flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors",
                                        req.met ? "text-green-500" : "text-muted-foreground/50"
                                    )}>
                                        {req.met ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                        {req.label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative group/field">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within/field:text-primary transition-colors" />
                            <Input
                                type="password"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="pl-12 h-12 rounded-xl bg-background/50 border-white/10 focus:ring-primary/20 transition-all font-medium"
                                required
                            />
                        </div>
                        <Button
                            type="submit"
                            className={cn(
                                "w-full h-12 rounded-xl font-bold text-md transition-all duration-300 shadow-xl text-white outline-none",
                                "btn-premium glow-primary"
                            )}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="animate-spin" /> : "Reset Password"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
