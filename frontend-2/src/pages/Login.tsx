import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import api from "../lib/axios";
import { useAuth, User } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { BrainCircuit, Mail, Lock, ArrowRight, Loader2, Star, ShieldCheck, Users, Eye, EyeOff } from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      const res = await api.post<{ user: User }>("/auth/login", {
        email,
        password,
      });

      login(res.data.user);
      toast.success("Welcome back! Loading your dashboard...");
      navigate(res.data.user.role === "recruiter" ? "/recruiter" : "/interviews");
    } catch (err: unknown) {
      const errorData = (err as { response?: { data?: { message?: string } } }).response?.data;
      const message = errorData?.message || "Invalid credentials. Please verify your email and password.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6 bg-background relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center relative z-10">

        {/* Left Side: Social Proof & Visual Branding */}
        <div className="hidden lg:flex flex-col space-y-10 animate-in fade-in slide-in-from-left-8 duration-1000">
          <div className="space-y-6">
            <div className="inline-flex bg-primary/10 p-3 rounded-2xl border border-primary/20 text-primary">
              <BrainCircuit className="h-8 w-8" />
            </div>
            <h1 className="text-6xl font-black tracking-tighter leading-[1.1] text-gradient">
              Accelerate Your <br /> Tech Career.
            </h1>
            <p className="text-xl text-muted-foreground font-medium max-w-md leading-relaxed">
              Join thousands of developers using AI-powered insights to crack their dream job interviews.
            </p>
          </div>

          <div className="grid gap-6">
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
              <div className="bg-emerald-500/20 p-2 rounded-xl">
                <Users className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Global Community</p>
                <p className="text-lg font-bold">12,000+ Active Learners</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
              <div className="bg-blue-500/20 p-2 rounded-xl">
                <Star className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Expert Approved</p>
                <p className="text-lg font-bold">4.9/5 Rating on TechReview</p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex -space-x-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 w-10 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-black italic">
                DEV
              </div>
            ))}
            <div className="flex items-center justify-center h-10 px-4 rounded-full border-2 border-background bg-white/5 text-xs font-black">
              AND MANY OTHERS
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0 animate-in fade-in slide-in-from-right-8 duration-1000">
          <Card className="glass-card border-white/10 shadow-2xl overflow-hidden rounded-[2.5rem]">
            <CardHeader className="pt-10 pb-2 px-10">
              <div className="lg:hidden flex justify-center mb-6">
                <div className="bg-primary p-3 rounded-2xl shadow-xl glow-primary">
                  <BrainCircuit className="text-white h-8 w-8" />
                </div>
              </div>
              <CardTitle className="text-3xl font-black tracking-tight text-center lg:text-left">Welcome Back</CardTitle>
              <CardDescription className="text-lg font-medium text-center lg:text-left">Continue your technical journey.</CardDescription>
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
                      onChange={(e) => setPassword(e.target.value)}
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
                    <div className="flex justify-end">
                      <Link
                        to="/forgot-password"
                        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  </div>
                </div>

                {error && error.includes("not verified") && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-yellow-500/20 text-yellow-500 hover:bg-yellow-500/10"
                    onClick={async () => {
                      try {
                        await api.post("/auth/resend-verification", { email });
                        toast.success("Verification email sent!");
                      } catch (e) {
                        toast.error("Failed to resend email.");
                      }
                    }}
                  >
                    Resend Verification Email
                  </Button>
                )}

                <Button
                  type="submit"
                  className={cn(
                    "w-full h-14 rounded-2xl font-black text-lg transition-all duration-300 shadow-xl text-white",
                    "btn-premium glow-primary"
                  )}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2 text-sm uppercase tracking-widest">
                      <Loader2 className="h-5 w-5 animate-spin" /> Verifying...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 uppercase tracking-widest text-sm font-black">
                      Sign In <ArrowRight className="h-5 w-5" />
                    </div>
                  )}
                </Button>
              </form>

              <div className="pt-6 border-t border-white/5 text-center">
                <p className="text-muted-foreground font-medium">
                  New here?{" "}
                  <Link to="/signup" className="text-primary font-black hover:underline underline-offset-4">
                    Create Account
                  </Link>
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest">
                <ShieldCheck className="h-3 w-3" />
                Secure authentication
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};