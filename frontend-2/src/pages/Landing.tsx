import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Sparkles, BrainCircuit, BarChart3, Rocket, CheckCircle, ArrowRight } from "lucide-react";

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handlePrimaryAction = () => {
    if (user) {
      navigate("/interviews");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen selection:bg-primary/20 bg-background overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg glow-primary">
              <BrainCircuit className="text-white h-6 w-6" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight font-heading">
              Interview<span className="text-primary">AI</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Button onClick={() => navigate("/interviews")} variant="ghost" className="font-semibold">
                Dashboard
              </Button>
            ) : (
              <Button onClick={() => navigate("/login")} variant="ghost" className="font-semibold">
                Sign In
              </Button>
            )}
            <Button className="btn-premium font-bold px-6 rounded-full shadow-lg text-white" onClick={handlePrimaryAction}>
              {user ? "Resume Practice" : "Get Started"}
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary animate-in fade-in slide-in-from-top-4 duration-1000">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-bold tracking-wide uppercase">AI-Powered Excellence</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black font-heading leading-tight animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Master Your Next <br />
            <span className="text-gradient">Tech Interview</span>
          </h1>

          <p className="max-w-2xl mx-auto text-xl text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Practice with our sophisticated AI that adapts to your skills.
            Get instant feedback, technical insights, and the confidence to land your dream job.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <Button size="lg" className="btn-premium h-14 px-10 text-lg font-bold rounded-full shadow-2xl glow-primary text-white" onClick={handlePrimaryAction}>
              Launch Session <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-10 text-lg font-bold rounded-full border-2 hover:bg-muted/50" onClick={() => navigate("/interviews")}>
              View Case Studies
            </Button>
          </div>

          {/* Floating UI Elements Mockup */}
          <div className="mt-20 relative animate-in zoom-in-95 fade-in duration-1000 delay-500">
            <div className="glass shadow-2xl rounded-3xl p-4 max-w-4xl mx-auto border-white/20 overflow-hidden relative group">
              <div className="bg-muted/50 rounded-2xl w-full aspect-video flex items-center justify-center p-8 group-hover:scale-[1.01] transition-transform duration-700">
                <div className="space-y-6 w-full max-w-lg text-left">
                  <div className="h-8 bg-background/80 rounded-full w-3/4 animate-pulse" />
                  <div className="space-y-3">
                    <div className="h-4 bg-background/60 rounded-full w-full" />
                    <div className="h-4 bg-background/60 rounded-full w-5/6" />
                  </div>
                  <div className="flex gap-3 justify-end pt-4">
                    <div className="h-12 bg-primary/20 rounded-xl w-32" />
                    <div className="h-12 bg-primary rounded-xl w-40" />
                  </div>
                </div>
              </div>
              {/* Decorative Glows */}
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
            </div>

            {/* Drifting stats badges */}
            <div className="absolute -top-10 -right-5 md:right-10 glass p-4 rounded-2xl shadow-xl animate-float">
              <div className="flex items-center gap-3">
                <div className="bg-green-500/20 p-2 rounded-lg"><CheckCircle className="text-green-500 h-5 w-5" /></div>
                <div className="text-left"><p className="text-xs font-bold text-muted-foreground uppercase leading-none">Score</p><p className="text-xl font-black">9.2/10</p></div>
              </div>
            </div>
            <div className="absolute top-1/2 -left-5 md:left-5 glass p-4 rounded-2xl shadow-xl animate-float" style={{ animationDelay: '1.5s' }}>
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 p-2 rounded-lg"><BarChart3 className="text-primary h-5 w-5" /></div>
                <div className="text-left"><p className="text-xs font-bold text-muted-foreground uppercase leading-none">Growth</p><p className="text-xl font-black">+24%</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-32">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl font-extrabold leading-tight">Advanced Platform Features</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">Everything you need to go from "candidate" to "hired" using state-of-the-art AI.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <BrainCircuit className="h-8 w-8 text-primary" />,
              title: "Adaptive AI",
              desc: "Questions that evolve based on your performance to keep you challenged.",
              bg: "bg-primary/5"
            },
            {
              icon: <BarChart3 className="h-8 w-8 text-blue-500" />,
              title: "Granular Analytics",
              desc: "Track your progress with detailed scores, trends, and focused feedback.",
              bg: "bg-blue-500/5"
            },
            {
              icon: <Rocket className="h-8 w-8 text-purple-500" />,
              title: "Real-Time Feedback",
              desc: "Get instant evaluations on your answers with ideal comparison guides.",
              bg: "bg-purple-500/5"
            }
          ].map((f, i) => (
            <div key={i} className="glass-card p-10 group relative">
              <div className={`${f.bg} w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110 duration-500`}>
                {f.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4">{f.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <BrainCircuit className="text-primary h-6 w-6" />
            <span className="text-xl font-bold font-heading">InterviewAI</span>
          </div>
          <p className="text-muted-foreground text-sm">© 2026 InterviewAI. Empowering candidates worldwide.</p>
          <div className="flex gap-6">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">Terms</a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">Privacy</a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;