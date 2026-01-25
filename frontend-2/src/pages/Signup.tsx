import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import api from "../lib/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { BrainCircuit, User, Mail, Lock, ArrowRight, Loader2, Sparkles, Trophy, Rocket, ShieldCheck } from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";

export default function Signup() {
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setError(null);

        if (!name || !email || !password) {
            const msg = "Please fill in all fields";
            setError(msg);
            toast.warning(msg);
            return;
        }

        try {
            setLoading(true);
            const res = await api.post<{ token: string }>("/auth/register", {
                name,
                email,
                password,
            });

            login(res.data.token, "candidate");
            toast.success("Account created! Let's start practicing.");
            navigate("/interviews");
        } catch (err: unknown) {
            const errorData = (err as { response?: { data?: { message?: string } } }).response?.data;
            const message = errorData?.message || "Registration failed. Try a different email.";
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6 bg-background relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] animate-pulse delay-1000" />
            </div>

            <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center relative z-10">

                {/* Left Side: Value Proposition */}
                <div className="order-2 lg:order-1 flex flex-col space-y-10 animate-in fade-in slide-in-from-left-8 duration-1000">
                    <div className="space-y-6">
                        <div className="inline-flex bg-primary/10 p-3 rounded-2xl border border-primary/20 text-primary animate-bounce">
                            <Sparkles className="h-8 w-8" />
                        </div>
                        <h1 className="text-6xl font-black tracking-tighter leading-[1.1] text-gradient">
                            Sharpen Your <br /> Technical Edge.
                        </h1>
                        <p className="text-xl text-muted-foreground font-medium max-w-md leading-relaxed">
                            Experience the future of interview prep. Instant feedback, behavioral analysis, and industry-standard questions.
                        </p>
                    </div>

                    <div className="grid gap-6">
                        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                            <div className="bg-purple-500/20 p-2 rounded-xl">
                                <Trophy className="h-5 w-5 text-purple-500" />
                            </div>
                            <div>
                                <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Mastery Path</p>
                                <p className="text-lg font-bold">1,500+ Curated Questions</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                            <div className="bg-primary/20 p-2 rounded-xl">
                                <Rocket className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Fast Results</p>
                                <p className="text-lg font-bold">Launch Sessions in Seconds</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Signup Form */}
                <div className="order-1 lg:order-2 w-full max-w-md mx-auto lg:mx-0 animate-in fade-in slide-in-from-right-8 duration-1000">
                    <Card className="glass-card border-white/10 shadow-2xl overflow-hidden rounded-[2.5rem]">
                        <CardHeader className="pt-10 pb-2 px-10">
                            <div className="lg:hidden flex justify-center mb-6">
                                <div className="bg-primary p-3 rounded-2xl shadow-xl glow-primary">
                                    <BrainCircuit className="text-white h-8 w-8" />
                                </div>
                            </div>
                            <CardTitle className="text-3xl font-black tracking-tight text-center lg:text-left">Join the Elite</CardTitle>
                            <CardDescription className="text-lg font-medium text-center lg:text-left">Start practicing for free today.</CardDescription>
                        </CardHeader>

                        <CardContent className="p-10 space-y-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm font-bold p-4 rounded-xl animate-in shake duration-500">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div className="relative group/field">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within/field:text-primary transition-colors" />
                                        <Input
                                            placeholder="Full Name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="pl-12 h-14 rounded-2xl bg-background/50 border-white/10 focus:ring-primary/20 transition-all font-medium"
                                            required
                                        />
                                    </div>

                                    <div className="relative group/field">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within/field:text-primary transition-colors" />
                                        <Input
                                            type="email"
                                            placeholder="Email Address"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-12 h-14 rounded-2xl bg-background/50 border-white/10 focus:ring-primary/20 transition-all font-medium"
                                            required
                                        />
                                    </div>

                                    <div className="relative group/field">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within/field:text-primary transition-colors" />
                                        <Input
                                            type="password"
                                            placeholder="Password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="pl-12 h-14 rounded-2xl bg-background/50 border-white/10 focus:ring-primary/20 transition-all font-medium"
                                            required
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className={cn(
                                        "w-full h-14 rounded-2xl font-black text-lg transition-all duration-300 shadow-xl text-white outline-none",
                                        "btn-premium glow-primary"
                                    )}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2 text-sm uppercase tracking-widest">
                                            <Loader2 className="h-5 w-5 animate-spin" /> Finalizing...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 uppercase tracking-widest text-sm font-black">
                                            Create Account <ArrowRight className="h-5 w-5" />
                                        </div>
                                    )}
                                </Button>
                            </form>

                            <div className="pt-6 border-t border-white/5 text-center">
                                <p className="text-muted-foreground font-medium">
                                    Already have an account?{" "}
                                    <Link to="/login" className="text-primary font-black hover:underline underline-offset-4">
                                        Sign In
                                    </Link>
                                </p>
                            </div>

                            <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest leading-none">
                                <ShieldCheck className="h-3 w-3" />
                                GDPR Compliant & Secure
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}

