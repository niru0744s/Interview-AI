import { Button } from "../ui/button";
import { Card, CardTitle, CardContent } from "../ui/card";
import { cn } from "../../lib/utils";
import { type Interview } from "../../hooks/useInterviews";
import { History, ArrowRight, PlayCircle, Eye, Calendar, Award } from "lucide-react";
import { motion } from "framer-motion";

interface InterviewHistoryListProps {
    interviews: Interview[];
    onAction: (interview: Interview) => void;
    onStartNew: () => void;
}

export default function InterviewHistoryList({ interviews, onAction, onStartNew }: InterviewHistoryListProps) {
    const containerVariants = {
        hidden: {},
        show: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 40 },
        show: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring" as const,
                stiffness: 100,
                damping: 15
            }
        }
    };

    return (
        <div className="relative min-h-[calc(100vh-4rem)] bg-[#050505] text-slate-100 p-6 md:p-10 rounded-xl font-sans">
            {/* Timeline dotted line */}
            {interviews.length > 0 && (
                <div className="absolute left-[3.25rem] md:left-[5.25rem] top-32 bottom-10 w-px border-l border-dotted border-slate-800 hidden sm:block z-0" />
            )}

            <div className="flex items-center justify-between mb-12 relative z-10">
                <h2 className="text-3xl font-black tracking-tight flex items-center gap-4 text-white">
                    <div className="bg-cyan-500/10 p-2.5 rounded-2xl border border-cyan-500/20">
                        <History className="h-6 w-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]" />
                    </div>
                    Recent Journey
                </h2>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/60 border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.1)] backdrop-blur-md">
                    <span className="text-xs font-black uppercase tracking-widest text-cyan-400">
                        {interviews.length} Total Sessions
                    </span>
                </div>
            </div>

            {interviews.length > 0 ? (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid gap-6 relative z-10"
                >
                    {interviews.map((interview, index) => (
                        <motion.div variants={itemVariants} key={interview._id}>
                            <Card
                                className="group cursor-pointer overflow-hidden transition-all duration-300 bg-white/[0.03] backdrop-blur-3xl rounded-2xl border-t border-l border-white/10 border-b border-r border-white/5 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]"
                                onClick={() => onAction(interview)}
                            >
                                <CardContent className="p-6 sm:p-8">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex items-start gap-8">
                                            <div className="hidden sm:flex flex-col items-center justify-center h-16 w-16 rounded-full bg-white/5 border border-white/10 font-mono font-black text-2xl text-slate-300 shadow-[inset_0_0_10px_rgba(255,255,255,0.05)] z-10">
                                                {index + 1}
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <span className={cn(
                                                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-1.5",
                                                        interview.status === "in_progress"
                                                            ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                                                            : interview.status === "completed"
                                                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                                                : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                                                    )}>
                                                        {interview.status === "in_progress" && (
                                                            <motion.div
                                                                animate={{ opacity: [0.3, 1, 0.3] }}
                                                                transition={{ duration: 1.5, repeat: Infinity }}
                                                                className="w-1.5 h-1.5 rounded-full bg-cyan-400 drop-shadow-[0_0_5px_cyan]"
                                                            />
                                                        )}
                                                        {interview.status.replace("_", " ")}
                                                    </span>
                                                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 font-mono">
                                                        <Calendar className="h-3 w-3" />
                                                        Session #{index + 1}
                                                    </div>
                                                </div>
                                                <CardTitle className="text-xl font-bold text-slate-100 leading-tight">
                                                    {interview.role || "Technical Session"}
                                                </CardTitle>
                                                <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                                    <Award className="h-4 w-4 text-cyan-500/70" />
                                                    Core Evaluation Plan • {interview.totalQuestions || 10} Critical Questions
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-white/5 pt-6 md:pt-0">
                                            <div className="flex flex-col items-center gap-2 md:px-8">
                                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Velocity</p>
                                                <div className="h-[2px] w-16 bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className={cn(
                                                            "h-full w-full",
                                                            interview.status === "in_progress"
                                                                ? "bg-gradient-to-r from-cyan-500/80 to-transparent"
                                                                : interview.status === "completed"
                                                                    ? "bg-gradient-to-r from-emerald-500/80 to-transparent"
                                                                    : "bg-gradient-to-r from-rose-500/80 to-transparent"
                                                        )}
                                                    />
                                                </div>
                                            </div>

                                            <div className="relative overflow-hidden rounded-2xl group/btn cursor-pointer">
                                                <Button
                                                    className="w-full relative h-14 px-8 rounded-2xl font-black uppercase tracking-widest gap-3 transition-all duration-300 shadow-[0_0_15px_rgba(34,211,238,0.2)] bg-gradient-to-br from-cyan-400 to-cyan-600 text-black hover:brightness-110 pointer-events-none"
                                                >
                                                    {interview.status === "in_progress" ? (
                                                        <><PlayCircle className="h-5 w-5" /> RE-ENTER</>
                                                    ) : (
                                                        <><Eye className="h-5 w-5" /> REVEAL</>
                                                    )}
                                                </Button>
                                                <motion.div
                                                    initial={{ x: "-100%" }}
                                                    animate={{ x: "200%" }}
                                                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
                                                    className="absolute inset-0 w-[150%] h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg] pointer-events-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                <Card className="border-white/10 border py-24 text-center bg-zinc-900/40 backdrop-blur-2xl rounded-3xl relative z-10 shadow-2xl">
                    <CardContent className="space-y-4">
                        <div className="bg-cyan-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 border border-cyan-500/20">
                            <History className="h-10 w-10 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]" />
                        </div>
                        <p className="text-3xl font-black text-white">No history yet</p>
                        <p className="text-slate-400 max-w-sm mx-auto text-lg font-medium leading-relaxed">
                            Launch your first AI session and permanently archive your path to mastery.
                        </p>
                        <Button onClick={onStartNew} className="mt-8 bg-gradient-to-br from-cyan-400 to-cyan-600 text-black font-black uppercase tracking-widest px-8 py-6 rounded-full hover:brightness-110 shadow-[0_0_15px_rgba(34,211,238,0.3)] group hover:scale-105 transition-all">
                            Configure session <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
