import { useEffect, useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import api from "../lib/axios";
import { Loader2, TrendingUp, Award, Target, Briefcase } from "lucide-react";

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
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!stats || stats.totalSessions === 0) {
        return (
            <Card className="border-dashed py-12 text-center">
                <CardContent>
                    <p className="text-muted-foreground text-lg">Not enough data for analytics yet.</p>
                    <p className="text-sm text-muted-foreground">Complete a few interviews to see your performance trends.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.averageScore}/10</div>
                        <p className="text-xs text-muted-foreground">Overall performance</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                        <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalSessions}</div>
                        <p className="text-xs text-muted-foreground">{stats.completedSessions} completed</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Top Role</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold truncate">
                            {stats.rolePerformance[0]?.role || "N/A"}
                        </div>
                        <p className="text-xs text-muted-foreground">Highest scoring role</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Improvement</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.performanceTimeline.length > 1
                                ? `${Math.round(((stats.performanceTimeline[stats.performanceTimeline.length - 1].score - stats.performanceTimeline[0].score) / 10) * 100)}%`
                                : "0%"}
                        </div>
                        <p className="text-xs text-muted-foreground">Since first session</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                {/* Growth Curve */}
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Performance History</CardTitle>
                        <CardDescription>How your interview scores have evolved over time</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats.performanceTimeline}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    domain={[0, 10]}
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: "8px",
                                        border: "none",
                                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="score"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={2}
                                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Verdict Distribution */}
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Success Rate</CardTitle>
                        <CardDescription>Distribution of interview outcomes</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex justify-center items-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.verdictDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {stats.verdictDistribution.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Role Performance */}
            <Card>
                <CardHeader>
                    <CardTitle>Role Breakdown</CardTitle>
                    <CardDescription>Average performance across different job roles</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.rolePerformance} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" domain={[0, 10]} fontSize={12} hide />
                            <YAxis
                                dataKey="role"
                                type="category"
                                fontSize={12}
                                width={120}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip cursor={{ fill: "transparent" }} />
                            <Bar
                                dataKey="avgScore"
                                fill="hsl(var(--primary))"
                                radius={[0, 4, 4, 0]}
                                barSize={30}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
