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
import { cn } from "../lib/utils";

type Stats = {
    totalSessions: number;
    completedSessions: number;
    averageScore: number;
    performanceTimeline: { score: number; date: string }[];
    verdictDistribution: { name: string; value: number }[];
    rolePerformance: { role: string; avgScore: number; sessions: number }[];
};

const COLORS = ["#10b981", "#f59e0b", "#ef4444"]; // Hire, Borderline, Reject

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
            <Card className="border-dashed border-2 py-20 text-center glass bg-transparent">
                <CardContent className="space-y-4">
                    <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Activity className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                    <p className="text-2xl font-bold">Insights pending</p>
                    <p className="text-muted-foreground text-lg max-w-xs mx-auto leading-relaxed">
                        Complete your first interview to unlock personalized performance analytics.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const firstScore = stats.performanceTimeline[0]?.score || 0;
    const lastScore = stats.performanceTimeline[stats.performanceTimeline.length - 1]?.score || 0;
    const improvement = stats.performanceTimeline.length > 1
        ? Math.round(((lastScore - firstScore) / 10) * 100)
        : 0;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Overview Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                    { title: "Average Score", val: `${stats.averageScore}/10`, sub: "Overall ranking", icon: <Target className="h-5 w-5" />, color: "text-blue-500", bg: "bg-blue-500/10" },
                    { title: "Total Sessions", val: stats.totalSessions, sub: `${stats.completedSessions} completed`, icon: <Activity className="h-5 w-5" />, color: "text-primary", bg: "bg-primary/10" },
                    { title: "Top Specialist", val: stats.rolePerformance[0]?.role || "N/A", sub: "Peak performance", icon: <Briefcase className="h-5 w-5" />, color: "text-purple-500", bg: "bg-purple-500/10" },
                    { title: "Improvement", val: `${improvement > 0 ? '+' : ''}${Math.abs(improvement)}%`, sub: "Since inception", icon: <TrendingUp className="h-5 w-5" />, color: "text-green-500", bg: "bg-green-500/10" },
                ].map((item, i) => (
                    <Card key={i} className="glass-card border-white/5 overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{item.title}</CardTitle>
                            <div className={cn("p-2 rounded-xl transition-transform group-hover:scale-110", item.bg, item.color)}>
                                {item.icon}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black">{item.val}</div>
                            <p className="text-sm font-medium text-muted-foreground/70 mt-1">{item.sub}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
                {/* Growth Curve */}
                <Card className="lg:col-span-4 glass-card border-white/5 overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">Mastery Evolution</CardTitle>
                        <CardDescription className="text-base">Real-time tracking of your technical growth trajectory</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px] pr-4">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <AreaChart data={stats.performanceTimeline}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="oklch(var(--primary))" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="oklch(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(var(--border) / 0.5)" />
                                <XAxis
                                    dataKey="date"
                                    fontSize={12}
                                    fontWeight={600}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: 'oklch(var(--muted-foreground))' }}
                                />
                                <YAxis
                                    domain={[0, 10]}
                                    ticks={[0, 2, 4, 6, 8, 10]}
                                    fontSize={12}
                                    fontWeight={600}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: 'oklch(var(--muted-foreground))' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'oklch(var(--card))',
                                        borderRadius: "16px",
                                        border: "1px solid oklch(var(--border))",
                                        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                                        padding: '12px'
                                    }}
                                    itemStyle={{ color: 'oklch(var(--primary))', fontWeight: 800 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="score"
                                    stroke="oklch(var(--primary))"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorScore)"
                                    dot={{ r: 4, fill: "oklch(var(--primary))", strokeWidth: 0 }}
                                    activeDot={{ r: 8, strokeWidth: 0, className: 'glow-primary' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Verdict Distribution */}
                <Card className="lg:col-span-3 glass-card border-white/5 overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">Outcome Velocity</CardTitle>
                        <CardDescription className="text-base">Distribution of your interview results</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px] flex flex-col justify-center items-center">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <PieChart>
                                <Pie
                                    data={stats.verdictDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={100}
                                    paddingAngle={8}
                                    dataKey="value"
                                    animationBegin={0}
                                    animationDuration={1500}
                                >
                                    {stats.verdictDistribution.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="stroke-background stroke-2 hover:opacity-80 transition-opacity" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'oklch(var(--card))',
                                        borderRadius: "16px",
                                        border: "1px solid oklch(var(--border))",
                                        padding: '12px'
                                    }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    align="center"
                                    iconType="circle"
                                    formatter={(val) => <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest ml-1">{val}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Role Performance */}
            <Card className="glass-card border-white/5 overflow-hidden">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                            <Award className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-bold">Skill Specialization</CardTitle>
                            <CardDescription className="text-base">Efficiency benchmarks across target roles</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="h-[350px] pt-4">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                        <BarChart data={stats.rolePerformance} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="oklch(var(--border) / 0.5)" />
                            <XAxis type="number" domain={[0, 10]} fontSize={12} hide />
                            <YAxis
                                dataKey="role"
                                type="category"
                                fontSize={14}
                                fontWeight={700}
                                width={180}
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: 'oklch(var(--foreground))' }}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(0, 0, 0, 0.04)' }}
                                contentStyle={{
                                    backgroundColor: '#1f2937',
                                    borderRadius: "8px",
                                    border: "none",
                                    fontWeight: "bold",
                                    color: '#f3f4f6'
                                }}
                                itemStyle={{ color: '#f3f4f6' }}
                            />
                            <Bar
                                dataKey="avgScore"
                                fill="oklch(var(--primary))"
                                radius={[0, 12, 12, 0]}
                                barSize={40}
                                activeBar={{ opacity: 0.8, filter: 'brightness(1.1)' }}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
