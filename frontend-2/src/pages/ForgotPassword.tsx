import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import api from "../lib/axios";
import { Link } from "react-router-dom";
import { Mail, ArrowRight, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { cn } from "../lib/utils";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post("/auth/forgot-password", { email });
            setSubmitted(true);
            toast.success("Reset link sent!");
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] animate-pulse" />
            </div>

            <Card className="max-w-md w-full glass-card border-white/10 shadow-2xl">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-black tracking-tight">Forgot Password?</CardTitle>
                    <CardDescription>Enter your email to receive a reset link.</CardDescription>
                </CardHeader>
                <CardContent>
                    {!submitted ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="relative group/field">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within/field:text-primary transition-colors" />
                                <Input
                                    type="email"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
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
                                {loading ? <Loader2 className="animate-spin" /> : "Send Reset Link"}
                            </Button>
                        </form>
                    ) : (
                        <div className="text-center space-y-4 animate-in fade-in zoom-in duration-300">
                            <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center text-green-500">
                                <Mail className="h-8 w-8" />
                            </div>
                            <p className="text-muted-foreground">
                                If an account exists for <strong>{email}</strong>, you will receive a reset link shortly.
                            </p>
                            <Button
                                variant="outline"
                                onClick={() => setSubmitted(false)}
                                className="mt-4 border-white/10 hover:bg-white/5"
                            >
                                Try another email
                            </Button>
                        </div>
                    )}
                    <div className="mt-6 text-center">
                        <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2">
                            <ArrowLeft className="h-4 w-4" /> Back to Login
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
