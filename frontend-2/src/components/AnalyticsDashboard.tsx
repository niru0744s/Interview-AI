import { useEffect, useState } from "react";
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    BarChart,
    Bar,
    AreaChart,
    Area,
    Cell,
    Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import api from "../lib/axios";
import { Loader2, TrendingUp, Award, Target, Briefcase, Activity } from "lucide-react";

type Stats = {
    totalSessions: number;
    completedSessions: number;
    averageScore: number;
    performanceTimeline: { score: number; date: string }[];
    verdictDistribution: { name: string; value: number }[];
    rolePerformance: { role: string; avgScore: number; sessions: number }[];
};

const COLORS = ["#22D3EE", "#475569", "#EF4444"]; // Hire, Borderline, Reject

export default function AnalyticsDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get<Stats>("/interview/stats");
                setStats(res.data);
            } catch (error) {
                console.error("Failed to fetch stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    if (!stats || stats.totalSessions === 0) {
        return (
            <div className="bg-[#050505] min-h-[calc(100vh-4rem)] p-6 md:p-10 text-white rounded-xl">
                <Card className="border-white/10 border py-20 text-center bg-zinc-900/40 backdrop-blur-2xl">
                    <CardContent className="space-y-4">
                        <div className="bg-cyan-400/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Activity className="h-8 w-8 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]" />
                        </div>
                        <p className="text-2xl font-bold font-sans">Insights pending</p>
                        <p className="text-slate-400 text-lg max-w-xs mx-auto leading-relaxed font-sans">
                            Complete your first interview to unlock personalized performance analytics.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const firstScore = stats.performanceTimeline[0]?.score || 0;
    const lastScore = stats.performanceTimeline[stats.performanceTimeline.length - 1]?.score || 0;
    const improvement = stats.performanceTimeline.length > 1
        ? Math.round(((lastScore - firstScore) / 10) * 100)
        : 0;

    return (
        <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-700 bg-[#050505] min-h-[calc(100vh-4rem)] text-white rounded-xl">
            {/* Overview Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                    { title: "Average Score", val: `${stats.averageScore}/10`, sub: "Overall ranking", icon: <Target className="h-5 w-5 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]" /> },
                    { title: "Total Sessions", val: stats.totalSessions, sub: `${stats.completedSessions} completed`, icon: <Activity className="h-5 w-5 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]" /> },
                    { title: "Top Specialist", val: stats.rolePerformance[0]?.role || "N/A", sub: "Peak performance", icon: <Briefcase className="h-5 w-5 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]" /> },
                    { title: "Improvement", val: `${improvement > 0 ? '+' : ''}${Math.abs(improvement)}%`, sub: "Since inception", icon: <TrendingUp className="h-5 w-5 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]" /> },
                ].map((item, i) => (
                    <Card key={i} className="bg-zinc-900/40 backdrop-blur-2xl border-white/10 overflow-hidden shadow-2xl">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs uppercase tracking-[0.2em] text-slate-500 font-sans font-semibold">{item.title}</CardTitle>
                            <div className="p-2 rounded-xl transition-transform group-hover:scale-110 bg-cyan-400/10 text-cyan-400">
                                {item.icon}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black font-mono text-white">{item.val}</div>
                            <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-widest font-sans">{item.sub}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
                {/* Growth Curve */}
                <Card className="lg:col-span-4 bg-zinc-900/40 backdrop-blur-2xl border-white/10 overflow-hidden shadow-2xl">
                    <CardHeader>
                        <CardTitle className="text-2xl font-black tracking-tight font-sans text-white">Mastery Evolution</CardTitle>
                        <CardDescription className="text-sm text-slate-400 font-sans">Real-time tracking of your technical growth trajectory</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px] pr-4">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <AreaChart data={stats.performanceTimeline}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#22D3EE" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                                <XAxis
                                    dataKey="date"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: '#64748b', fontFamily: 'monospace' }}
                                />
                                <YAxis
                                    domain={[0, 10]}
                                    ticks={[0, 2, 4, 6, 8, 10]}
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: '#64748b', fontFamily: 'monospace' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#0f172a',
                                        borderRadius: "12px",
                                        border: "1px solid rgba(255,255,255,0.1)",
                                        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.5)",
                                        padding: '12px',
                                        fontFamily: 'monospace'
                                    }}
                                    itemStyle={{ color: '#22D3EE', fontWeight: 600 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="score"
                                    stroke="#22D3EE"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorScore)"
                                    style={{ filter: "drop-shadow(0 0 6px #22D3EE)" }}
                                    activeDot={{ r: 6, fill: "#22D3EE", strokeWidth: 0, style: { filter: "drop-shadow(0 0 8px #22D3EE)" } }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Verdict Distribution */}
                <Card className="lg:col-span-3 bg-zinc-900/40 backdrop-blur-2xl border-white/10 overflow-hidden shadow-2xl">
                    <CardHeader>
                        <CardTitle className="text-2xl font-black tracking-tight font-sans text-white">Outcome Velocity</CardTitle>
                        <CardDescription className="text-sm text-slate-400 font-sans">Distribution of your interview results</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px] flex flex-col justify-center items-center">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <PieChart>
                                <Pie
                                    data={stats.verdictDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={75}
                                    outerRadius={95}
                                    paddingAngle={4}
                                    dataKey="value"
                                    stroke="none"
                                    animationBegin={0}
                                    animationDuration={1500}
                                >
                                    {stats.verdictDistribution.map((_, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={COLORS[index % COLORS.length]} 
                                            style={index === 0 ? { filter: "drop-shadow(0 0 8px rgba(34,211,238,0.6))" } : undefined}
                                            className="hover:opacity-80 transition-opacity" 
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#0f172a',
                                        borderRadius: "12px",
                                        border: "1px solid rgba(255,255,255,0.1)",
                                        padding: '12px',
                                        fontFamily: 'monospace'
                                    }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    align="center"
                                    iconType="circle"
                                    formatter={(val) => <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] ml-2 font-sans">{val}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Role Performance */}
            <Card className="bg-zinc-900/40 backdrop-blur-2xl border-white/10 overflow-hidden shadow-2xl">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-cyan-400/10 text-cyan-400">
                            <Award className="h-6 w-6 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-black tracking-tight font-sans text-white">Skill Specialization</CardTitle>
                            <CardDescription className="text-sm text-slate-400 font-sans">Efficiency benchmarks across target roles</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="h-[350px] pt-4">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                        <BarChart data={stats.rolePerformance} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#ffffff05" />
                            <XAxis type="number" domain={[0, 10]} fontSize={11} hide />
                            <YAxis
                                dataKey="role"
                                type="category"
                                fontSize={12}
                                fontWeight={600}
                                width={180}
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: '#E2E8F0', fontFamily: 'monospace' }}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }}
                                contentStyle={{
                                    backgroundColor: '#0f172a',
                                    borderRadius: "12px",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    fontWeight: "bold",
                                    color: '#E2E8F0',
                                    fontFamily: 'monospace'
                                }}
                                itemStyle={{ color: '#22D3EE' }}
                            />
                            <Bar
                                dataKey="avgScore"
                                fill="#22D3EE"
                                radius={[0, 10, 10, 0]}
                                barSize={32}
                                activeBar={{ opacity: 0.8, filter: 'drop-shadow(0 0 8px rgba(34,211,238,0.6))' }}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
