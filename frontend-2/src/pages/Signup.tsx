import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import api from "../lib/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { BrainCircuit, User, Mail, Lock, ArrowRight, Loader2, Sparkles, Trophy, Rocket, ShieldCheck, Eye, EyeOff, Check, X } from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";

export default function Signup() {
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [strength, setStrength] = useState<number>(0);
    const [requirements, setRequirements] = useState({
        length: false,
        upper: false,
        number: false,
        special: false
    });

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const { } = useAuth();
    const navigate = useNavigate();

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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setError(null);

        if (!name || !email || !password) {
            const msg = "Please fill in all fields";
            setError(msg);
            toast.warning(msg);
            return;
        }

        if (strength < 100) {
            const msg = "Password is too weak. Please meet all requirements.";
            setError(msg);
            toast.warning(msg);
            return;
        }

        try {
            setLoading(true);
            const res = await api.post<{ user: { email: string, role: "candidate" | "recruiter" } }>("/auth/register", {
                name,
                email,
                password,
            });

            if (res.data.user) {
                toast.success("Account created! Please check your email to verify.");
                navigate("/login");
            }
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
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Password"
                                            value={password}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setPassword(val);
                                                checkStrength(val);
                                            }}
                                            className="pl-12 pr-12 h-14 rounded-2xl bg-background/50 border-white/10 focus:ring-primary/20 transition-all font-medium"
                                            required
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

