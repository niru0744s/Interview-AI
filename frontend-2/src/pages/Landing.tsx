import { Suspense, lazy, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  BrainCircuit,
  ArrowRight,
  Zap,
  MessageSquare,
  Users,
  TrendingUp,
  Star,
  CheckCircle2,
  Brain,
} from "lucide-react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";

const Spline = lazy(() => import("@splinetool/react-spline"));

/* ─── Data ─── */
const candidates = [
  { name: "Arjun Sharma", role: "Senior SWE", score: 94, skills: ["System Design", "DSA", "React"] },
  { name: "Priya Nair", role: "ML Engineer", score: 87, skills: ["Python", "TensorFlow", "SQL"] },
  { name: "Liam Torres", role: "DevOps Lead", score: 76, skills: ["Kubernetes", "CI/CD", "AWS"] },
];

/* ─── Floating pill badge ─── */
function FloatingBadge({
  icon,
  label,
  sub,
  color,
  duration,
  delay,
  style,
}: {
  icon: React.ReactNode;
  label: string;
  sub?: string;
  color: string;
  duration: number;
  delay: number;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      animate={{ y: [0, -12, 0], rotate: [0, 1, 0, -1, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
      whileHover={{ scale: 1.05 }}
      className="absolute flex items-center gap-2.5 px-4 py-3 rounded-2xl cursor-default select-none"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 20px ${color}11`,
        willChange: "transform",
        ...style,
      }}
    >
      <div
        className="p-1.5 rounded-xl flex-shrink-0"
        style={{ background: `${color}11` }}
      >
        {icon}
      </div>
      <div>
        <p className="text-white font-black text-sm leading-none tracking-tight">{label}</p>
        {sub && <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest mt-1">{sub}</p>}
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════ */
const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadSpline, setLoadSpline] = useState(false);

  useEffect(() => {
    // Defer loading heavy 3D canvas until after first paint on desktop
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      if ("requestIdleCallback" in window) {
        const id = (window as unknown as { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback(
          () => setLoadSpline(true),
          { timeout: 1200 }
        );
        return () => {
          if ("cancelIdleCallback" in window) {
            (window as unknown as { cancelIdleCallback: (n: number) => void }).cancelIdleCallback(id);
          }
        };
      } else {
        const timer = setTimeout(() => setLoadSpline(true), 800);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  /* ─── Scroll-linked Transforms ─── */
  // Robot transforms - NOW STATIC as per user request
  const staticRobotScale = 1;
  const staticRobotY = 350;
  const staticRobotOpacity = 1;

  // Hero Section
  const heroOpacity = useTransform(smoothProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(smoothProgress, [0, 0.15], [1, 0.95]);
  const heroY = useTransform(smoothProgress, [0, 0.15], [0, -200]); // Slide hero up
  const heroLeftX = useTransform(smoothProgress, [0, 0.15], [0, -100]);
  const heroRightX = useTransform(smoothProgress, [0, 0.15], [0, 100]);

  // Bento Grid Section
  const bentoOpacity = useTransform(smoothProgress, [0.15, 0.25, 0.5, 0.6], [0, 1, 1, 0]);
  const bentoY = useTransform(smoothProgress, [0.15, 0.25, 0.5, 0.6], [400, 0, 0, -400]); // Large slide in/out
  const bentoScale = useTransform(smoothProgress, [0.15, 0.25, 0.5, 0.6], [0.8, 1, 1, 0.8]);

  // Recruiter Section
  const recruiterOpacity = useTransform(smoothProgress, [0.6, 0.7, 0.9, 1], [0, 1, 1, 0]);
  const recruiterY = useTransform(smoothProgress, [0.6, 0.7, 0.9, 1], [400, 0, 0, -400]); // Large slide in/out

  // Final CTA
  const ctaOpacity = useTransform(smoothProgress, [0.9, 0.95], [0, 1]);
  const ctaScale = useTransform(smoothProgress, [0.9, 0.95], [0.9, 1]);
  const ctaY = useTransform(smoothProgress, [0.9, 0.95], [200, 0]); // Slide cta up

  const handlePrimaryAction = () =>
    user ? navigate("/interviews") : navigate("/login");

  return (
    <div
      ref={containerRef}
      className="relative bg-[#050505] selection:bg-cyan-500/30 overflow-x-clip"
      style={{ overflowX: "clip" }}
    >
      {/* ══════════════════════ NAVBAR ══════════════════════ */}
      <nav
        className="fixed top-0 w-full z-[100] border-b border-white/5 bg-transparent pointer-events-none"
      >
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between pointer-events-none">
          <button onClick={() => navigate("/")} className="flex items-center gap-2.5 group pointer-events-auto">
            <div
              className="p-1.5 rounded-lg transition-transform group-hover:rotate-12"
              style={{
                background: "linear-gradient(135deg, #22D3EE, #94A3B8)",
                boxShadow: "0 0 15px rgba(34, 211, 238, 0.3)",
              }}
            >
              <BrainCircuit className="h-4 w-4 text-black" />
            </div>
            <span className="text-lg font-black tracking-tighter text-white">
              Interview<span className="text-cyan-400">AI</span>
            </span>
          </button>

          <div className="hidden md:flex items-center gap-8 pointer-events-auto">
            {["Features", "Pricing", "For Recruiters"].map((item) => (
              <button
                key={item}
                onClick={() => (item === "Pricing" ? navigate("/pricing") : undefined)}
                className="text-xs font-bold uppercase tracking-widest text-white/40 hover:text-cyan-400 transition-colors pointer-events-auto"
              >
                {item}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 pointer-events-auto">
            <button
              onClick={() => navigate(user ? "/interviews" : "/login")}
              className="text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors pointer-events-auto"
            >
              {user ? "Portal" : "Sign In"}
            </button>
            <button
              onClick={handlePrimaryAction}
              className="text-xs font-black uppercase tracking-widest text-black px-5 py-2 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 glow-cyan pointer-events-auto"
              style={{
                background: "linear-gradient(135deg, #22D3EE 0%, #E2E8F0 100%)",
              }}
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ══════════════════════ FIXED BACKGROUND (ROBOT) ══════════════════════ */}
      <div className="fixed inset-0 z-0 flex items-center justify-center overflow-visible">
        {/* Glow orbs */}
        <div
          className="absolute w-[800px] h-[800px] rounded-full blur-[120px] opacity-20"
          style={{ background: "radial-gradient(circle, #22D3EE, transparent)", top: "20%", left: "10%" }}
        />
        <div
          className="absolute w-[600px] h-[600px] rounded-full blur-[100px] opacity-10"
          style={{ background: "radial-gradient(circle, #E2E8F0, transparent)", bottom: "10%", right: "10%" }}
        />

        <motion.div
          style={{
            scale: staticRobotScale,
            opacity: staticRobotOpacity,
            y: staticRobotY,
          }}
          className="relative w-full h-full flex items-center justify-center overflow-visible"
        >
          <Suspense fallback={null}>
            <div
              className="w-full h-[200vh] flex items-center justify-center overflow-visible"
              onWheelCapture={(e) => e.stopPropagation()}
              onTouchStartCapture={(e) => e.stopPropagation()}
              onTouchMoveCapture={(e) => e.stopPropagation()}
              onPointerDownCapture={(e) => e.stopPropagation()}
            >
              {loadSpline ? (
                <Spline
                  scene="https://prod.spline.design/dhb0v5FSbB1IMMYP/scene.splinecode"
                  style={{ width: "100%", height: "100%", background: "transparent", pointerEvents: "auto", overflow: "visible" }}
                  className="overflow-visible"
                />
              ) : (
                <div className="w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[100px] animate-pulse" />
              )}
            </div>
          </Suspense>

          {/* Floating badges around robot head/chest area */}
          <div className="absolute inset-0 max-w-4xl mx-auto pointer-events-none">
            <FloatingBadge
              icon={<CheckCircle2 className="h-4 w-4 text-cyan-400" />}
              label="9.4/10 Score"
              sub="Technical accuracy"
              color="#22D3EE"
              duration={8}
              delay={0}
              style={{ top: "22%", left: "15%" }}
            />
            <FloatingBadge
              icon={<MessageSquare className="h-4 w-4 text-white" />}
              label="Real-time Feedback"
              sub="AI Assistant"
              color="#E2E8F0"
              duration={10}
              delay={1}
              style={{ top: "35%", right: "10%" }}
            />
            <FloatingBadge
              icon={<Brain className="h-4 w-4 text-cyan-400" />}
              label="Adaptive AI"
              sub="Dynamic difficulty"
              color="#22D3EE"
              duration={7}
              delay={2}
              style={{ bottom: "25%", left: "20%" }}
            />
          </div>
        </motion.div>
      </div>

      {/* ══════════════════════ SCROLLABLE CONTENT LAYERS ══════════════════════ */}
      <div className="relative z-10 pointer-events-none">

        {/* HERO SCENE */}
        <section className="h-screen flex items-center justify-center sticky top-0">
          <div className="w-full max-w-7xl mx-auto px-6 grid grid-cols-2 gap-x-[400px] items-center pointer-events-none">
            <motion.div
              style={{ opacity: heroOpacity, x: heroLeftX, scale: heroScale, y: heroY }}
              className="text-right flex flex-col items-end gap-6"
            >
              <h1 className="text-7xl xl:text-8xl font-black tracking-tighter leading-none text-white uppercase pointer-events-none">
                Master<br />Your<br />Next
              </h1>
              <motion.button
                onClick={handlePrimaryAction}
                className="animate-weightless flex items-center gap-3 font-black uppercase tracking-[0.2em] text-[10px] text-black px-10 py-4 rounded-full glow-cyan pointer-events-auto"
                style={{ background: "linear-gradient(135deg, #22D3EE, #E2E8F0)" }}
              >
                Practice Now <ArrowRight className="h-4 w-4" />
              </motion.button>
            </motion.div>

            <motion.div
              style={{ opacity: heroOpacity, x: heroRightX, scale: heroScale, y: heroY }}
              className="text-left"
            >
              <h1 className="text-7xl xl:text-8xl font-black tracking-tighter leading-none uppercase text-white pointer-events-none">
                Tech<br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-slate-400 pointer-events-none">
                  Interview
                </span>
              </h1>
              <p className="mt-8 text-white/30 text-sm font-bold uppercase tracking-widest max-w-xs leading-relaxed pointer-events-none">
                The world's first adaptive AI platform designed for the elite 1%.
              </p>
            </motion.div>
          </div>
        </section>

        {/* BENTO GRID SCENE */}
        <section className="h-screen flex items-center justify-center sticky top-0">
          <motion.div
            style={{ opacity: bentoOpacity, y: bentoY, scale: bentoScale }}
            className="w-full max-w-7xl mx-auto px-6 pointer-events-none"
          >
            <div className="text-center mb-12 pointer-events-none">
              <h2 className="text-4xl font-black tracking-tighter text-white uppercase mb-4 pointer-events-none">
                Platform Intelligence
              </h2>
              <div className="h-1 w-20 bg-cyan-500 mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[200px]">
              {/* Performance Growth */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                whileHover={{ scale: 1.02, zIndex: 10, borderColor: "rgba(34, 211, 238, 0.4)", boxShadow: "0 20px 40px rgba(34, 211, 238, 0.15)" }}
                className="md:col-span-2 md:row-span-2 rounded-[2rem] p-8 border border-white/10 bg-white/5 backdrop-blur-2xl flex flex-col gap-6 overflow-hidden relative group transition-colors duration-500 pointer-events-auto cursor-pointer"
              >
                <div className="flex items-center justify-between relative z-10 pointer-events-none">
                  <div>
                    <h3 className="text-lg font-black text-white tracking-tight uppercase pointer-events-none">Performance Growth</h3>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1 pointer-events-none">7-Week Trend</p>
                  </div>
                  <div className="text-3xl font-black text-cyan-400 tracking-tighter">
                    +41%
                  </div>
                </div>
                <div className="flex-1 relative z-10 w-full min-w-0 min-h-0 flex items-center justify-center pt-2">
                  <svg viewBox="0 0 300 120" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="cyanGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#22D3EE" />
                        <stop offset="100%" stopColor="#94A3B8" />
                      </linearGradient>
                      <linearGradient id="cyanArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0 100 Q 40 85, 75 75 T 150 45 T 225 25 T 300 10 L 300 120 L 0 120 Z"
                      fill="url(#cyanArea)"
                    />
                    <path
                      d="M 0 100 Q 40 85, 75 75 T 150 45 T 225 25 T 300 10"
                      fill="none"
                      stroke="url(#cyanGrad)"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full bg-cyan-500/10 blur-[60px] group-hover:bg-cyan-500/20 transition-colors duration-700" />
              </motion.div>

              {/* AI Feedback */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                whileHover={{ scale: 1.05, zIndex: 10, borderColor: "rgba(255, 255, 255, 0.3)", boxShadow: "0 20px 40px rgba(255, 255, 255, 0.05)" }}
                className="md:col-span-2 md:row-span-1 rounded-[2rem] p-6 border border-white/10 bg-white/5 backdrop-blur-2xl flex items-center gap-6 group transition-colors duration-300 pointer-events-auto cursor-pointer"
              >
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform pointer-events-none">
                  <Brain className="h-8 w-8 text-cyan-400" />
                </div>
                <div className="pointer-events-none">
                  <h3 className="text-base font-black text-white tracking-tight uppercase pointer-events-none">Instant AI Feedback</h3>
                  <p className="text-xs text-white/40 mt-1 leading-relaxed pointer-events-none">
                    Granular code analysis & communication pointers delivered in real-time.
                  </p>
                </div>
              </motion.div>

              {/* Recruiter Analytics */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                whileHover={{ scale: 1.05, zIndex: 10, borderColor: "rgba(34, 211, 238, 0.3)", boxShadow: "0 20px 40px rgba(34, 211, 238, 0.1)" }}
                className="md:col-span-1 md:row-span-1 rounded-[2rem] p-6 border border-white/10 bg-white/5 backdrop-blur-2xl flex flex-col justify-between group transition-colors duration-300 pointer-events-auto cursor-pointer"
              >
                <div className="flex items-center gap-3 pointer-events-none">
                  <Users className="h-4 w-4 text-white/40" />
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest pointer-events-none">Global Pool</span>
                </div>
                <div className="text-4xl font-black text-white tracking-tighter pointer-events-none">88%</div>
                <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest pointer-events-none">Percentile Target</p>
              </motion.div>

              {/* Benchmarking */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
                whileHover={{ scale: 1.05, zIndex: 10, borderColor: "rgba(148, 163, 184, 0.3)", boxShadow: "0 20px 40px rgba(148, 163, 184, 0.1)" }}
                className="md:col-span-1 md:row-span-1 rounded-[2rem] p-6 border border-white/10 bg-white/5 backdrop-blur-2xl flex flex-col justify-between group transition-colors duration-300 pointer-events-auto cursor-pointer"
              >
                <div className="flex items-center gap-3 pointer-events-none">
                  <TrendingUp className="h-4 w-4 text-white/40" />
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest pointer-events-none">Growth</span>
                </div>
                <div className="text-4xl font-black text-white tracking-tighter pointer-events-none">4.2x</div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pointer-events-none">Faster Placement</p>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* RECRUITER SUITE SCENE */}
        <section className="h-screen flex items-center justify-center sticky top-0">
          <motion.div
            style={{ opacity: recruiterOpacity, y: recruiterY }}
            className="w-full max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center pointer-events-none"
          >
            <div className="space-y-8">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/5">
                <Zap className="h-4 w-4 text-cyan-400" />
                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em]">Recruiter Intelligence</span>
              </div>
              <h2 className="text-6xl font-black tracking-tighter text-white uppercase leading-none pointer-events-none">
                Automate your<br />
                <span className="text-white/40 pointer-events-none">Screening.</span>
              </h2>
              <p className="text-white/30 text-lg leading-relaxed font-medium pointer-events-none">
                Our AI engine acts as a primary technical filter, scoring candidates on accuracy, speed, and approach.
              </p>
              <div className="flex gap-4 pointer-events-none">
                <button className="px-8 py-3 rounded-full bg-white text-black font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all pointer-events-auto">
                  Get Demo
                </button>
                <button className="px-8 py-3 rounded-full border border-white/10 bg-white/5 text-white font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all pointer-events-auto">
                  Pricing
                </button>
              </div>
            </div>

            <div className="relative h-[400px] flex items-center justify-center">
              {candidates.map((c, i) => (
                <motion.div
                  key={c.name}
                  animate={{ y: [0, -15, 0] }}
                  transition={{
                    y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 },
                  }}
                  whileHover={{ 
                    scale: 1.05, 
                    x: -20, 
                    zIndex: 20, 
                    borderColor: "rgba(34, 211, 238, 0.4)",
                    boxShadow: "0 30px 60px rgba(34, 211, 238, 0.15)" 
                  }}
                  className="absolute w-full max-w-sm rounded-[2rem] p-6 border border-white/10 bg-[#0A0A0A] backdrop-blur-xl pointer-events-auto cursor-pointer"
                  style={{
                    top: `${i * 30}px`,
                    right: `${i * 20}px`,
                    zIndex: 3 - i,
                    opacity: 1 - i * 0.2,
                    boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
                  }}
                >
                  <div className="flex justify-between items-start mb-4 pointer-events-none">
                    <div>
                      <h4 className="font-black text-white text-base tracking-tight pointer-events-none">{c.name}</h4>
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest pointer-events-none">{c.role}</p>
                    </div>
                    <div className="text-right pointer-events-none">
                      <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest pointer-events-none">Match</span>
                      <div className="text-2xl font-black text-white tracking-tighter pointer-events-none">{c.score}%</div>
                    </div>
                  </div>
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden pointer-events-none">
                    <div className="h-full bg-cyan-400" style={{ width: `${c.score}%` }} />
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4 pointer-events-none">
                    {c.skills.map(s => (
                      <span key={s} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[8px] font-black text-white/50 uppercase tracking-widest pointer-events-none">
                        {s}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* FINAL CTA SCENE */}
        <section className="h-screen flex items-center justify-center sticky top-0">
          <motion.div
            style={{ opacity: ctaOpacity, y: ctaY, scale: ctaScale }}
            className="w-full max-w-4xl mx-auto px-6 mt-20 pointer-events-none"
          >
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative rounded-[3rem] p-16 text-center border border-white/10 overflow-hidden pointer-events-none"
              style={{ background: "rgba(255,255,255,0.02)", boxShadow: "0 0 50px rgba(34,211,238,0.05)" }}
            >
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-500/10 via-transparent to-slate-500/10 pointer-events-none" />

              <div className="relative z-10 space-y-8">
                <span className="text-xs font-black text-cyan-400 uppercase tracking-[0.3em] pointer-events-none">Ignition Sequence</span>
                <h2 className="text-6xl font-black tracking-tighter text-white uppercase leading-none pointer-events-none">
                  Your next offer<br />starts here.
                </h2>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pointer-events-none">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePrimaryAction}
                    className="animate-weightless px-12 py-5 rounded-full text-black font-black uppercase tracking-widest text-xs glow-cyan pointer-events-auto"
                    style={{ background: "linear-gradient(135deg, #22D3EE, #E2E8F0)" }}
                  >
                    Launch Session
                  </motion.button>
                </div>
                <div className="flex items-center justify-center gap-6">
                  <div className="h-px w-10 bg-white/30" />
                  <div className="flex gap-2">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
                      >
                        <Star className="h-4 w-4 fill-cyan-400 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                      </motion.div>
                    ))}
                  </div>
                  <div className="h-px w-10 bg-white/30" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

      </div>

      {/* FOOTER */}
      <footer className="relative z-20 border-t border-white/5 py-12 px-6 pointer-events-none">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 pointer-events-none">
          <div className="flex items-center gap-2.5 pointer-events-auto cursor-pointer" onClick={() => navigate("/")}>
            <BrainCircuit className="h-5 w-5 text-cyan-400" />
            <span className="text-lg font-black tracking-tighter text-white uppercase pointer-events-none">
              Interview<span className="text-cyan-400">AI</span>
            </span>
          </div>
          <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.2em] pointer-events-none">
            © 2026 InterviewAI. Chromium Edition.
          </p>
          <div className="flex gap-8 pointer-events-auto">
            {["Twitter", "GitHub", "Safety"].map((item) => (
              <a key={item} href="#" className="text-white/20 hover:text-cyan-400 transition-colors text-[10px] font-bold uppercase tracking-widest pointer-events-auto">
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;