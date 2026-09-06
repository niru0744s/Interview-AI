import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Plus,
    Briefcase,
    Users,
    Check,
    LayoutDashboard,
    ChevronRight,
    Copy,
    Trash2,
    Laptop,
    X,
    ChevronDown,
} from "lucide-react";
import api from "../lib/axios";
import { toast } from "sonner";
import { cn } from "../lib/utils";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";

interface Template {
    _id: string;
    title: string;
    role: string;
    topic: string;
    description?: string;
    totalQuestions: number;
    difficulty: string;
    questionFormat?: string;
    category?: "technical" | "behavioral";
    inviteCode: string;
}

export default function RecruiterDashboard() {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState<Template[]>([]);
    const [stats, setStats] = useState({ activePosts: 0, totalCandidates: 0, topHires: 0 });
    const [loading, setLoading] = useState(true);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        title: "",
        role: "",
        topic: "",
        description: "",
        totalQuestions: 10,
        difficulty: "intermediate",
        questionFormat: "blend",
        category: "technical" as "technical" | "behavioral"
    });

    useEffect(() => {
        const loadDashboard = async () => {
            setLoading(true);
            await Promise.all([fetchTemplates(), fetchStats()]);
            setLoading(false);
        };
        loadDashboard();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get("/templates/stats");
            setStats(res.data);
        } catch {
            console.error("Failed to load recruiter stats");
        }
    };

    const fetchTemplates = async () => {
        try {
            const res = await api.get("/templates/my");
            setTemplates(res.data);
        } catch {
            toast.error("Failed to load your job templates");
        }
    };

    const handleCreateTemplate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsCreating(true);
            const res = await api.post("/templates", formData);
            setTemplates([res.data, ...templates]);
            // Refresh stats since activePosts increased
            fetchStats();
            setIsModalOpen(false);
            setFormData({ title: "", role: "", topic: "", description: "", totalQuestions: 10, difficulty: "intermediate", questionFormat: "blend", category: "technical" });
            toast.success("Job Template created successfully!");
        } catch {
            toast.error("Failed to create job template");
        } finally {
            setIsCreating(false);
        }
    };

    const copyInviteLink = (code: string) => {
        const link = `${window.location.origin}/invite/${code}`;
        navigator.clipboard.writeText(link);
        setCopiedCode(code);
        toast.success("Invite link copied to clipboard!");
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const deleteTemplate = async (id: string) => {
        if (!confirm("Are you sure you want to delete this template? All candidate data for this post will remain in results but the invite link will be deactivated.")) return;

        const deletePromise = api.delete(`/templates/${id}`);

        toast.promise(deletePromise, {
            loading: 'Deleting template...',
            success: () => {
                setTemplates(templates.filter(t => t._id !== id));
                fetchStats();
                return 'Template deleted successfully!';
            },
            error: 'Failed to delete template'
        });
    };

    return (
        <div className="min-h-screen bg-background p-8 pt-24 relative">
            <div className="max-w-7xl mx-auto space-y-10">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full border border-primary/20 text-primary text-xs font-black uppercase tracking-widest">
                            <Briefcase className="h-3 w-3" /> Enterprise Workspace
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter text-gradient leading-none">
                            Recruiter Portal
                        </h1>
                        <p className="text-muted-foreground font-medium text-lg">
                            Manage your job postings and monitor candidate skill scores.
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="btn-premium text-white font-black h-14 px-8 rounded-2xl shadow-xl glow-primary gap-2 uppercase tracking-widest text-sm"
                    >
                        <Plus className="h-5 w-5" /> Create New Job
                    </Button>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="glass-card border-white/10 overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <LayoutDashboard className="h-16 w-16" />
                        </div>
                        <CardHeader className="pb-2">
                            <CardDescription className="font-bold uppercase tracking-widest text-[10px]">Active Posts</CardDescription>
                            <CardTitle className="text-4xl font-black">{stats.activePosts}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xs font-medium text-emerald-500 flex items-center gap-1">
                                <Plus className="h-3 w-3" /> Updated live
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="glass-card border-white/10 overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <Users className="h-16 w-16" />
                        </div>
                        <CardHeader className="pb-2">
                            <CardDescription className="font-bold uppercase tracking-widest text-[10px]">Total Candidates</CardDescription>
                            <CardTitle className="text-4xl font-black">{stats.totalCandidates}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xs font-medium text-muted-foreground">Across all positions</div>
                        </CardContent>
                    </Card>
                    <Card className="glass-card border-white/10 overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <Check className="h-16 w-16" />
                        </div>
                        <CardHeader className="pb-2">
                            <CardDescription className="font-bold uppercase tracking-widest text-[10px]">Top Hires found</CardDescription>
                            <CardTitle className="text-4xl font-black">{stats.topHires}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xs font-medium text-muted-foreground">Ready for screening</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Area */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black tracking-tight">Your Job Templates</h2>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Sort by Date</Button>
                            <Button variant="ghost" size="sm" className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground text-primary">View All</Button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-[250px] rounded-3xl bg-white/5 animate-pulse border border-white/5" />
                            ))}
                        </div>
                    ) : templates.length === 0 ? (
                        <Card className="glass-card border-dashed border-white/10 flex flex-col items-center justify-center p-20 text-center space-y-6">
                            <div className="bg-primary/10 p-6 rounded-full">
                                <Briefcase className="h-12 w-12 text-primary" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black">No Job Templates Yet</h3>
                                <p className="text-muted-foreground max-w-xs mx-auto">Create your first job posting to start inviting candidates for AI screening.</p>
                            </div>
                            <Button
                                onClick={() => setIsModalOpen(true)}
                                className="btn-premium text-white font-black rounded-xl px-8 h-12 shadow-xl glow-primary"
                            >
                                Create Template
                            </Button>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {templates.map((template) => (
                                <Card key={template._id} className="glass-card border-white/10 group flex flex-col">
                                    <CardHeader className="p-6 pb-2">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-2">
                                                <div className="bg-primary/20 p-2 rounded-xl text-primary font-black text-[10px] uppercase tracking-tighter shadow-sm">
                                                    {template.inviteCode}
                                                </div>
                                                {template.category === "behavioral" ? (
                                                    <span className="bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                                                        HR & Behavioral
                                                    </span>
                                                ) : (
                                                    <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                                                        Technical
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => deleteTemplate(template._id)}
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <CardTitle className="text-xl font-black truncate">{template.title}</CardTitle>
                                        <CardDescription className="font-medium text-primary/70">{template.role} • {template.topic}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6 pt-4 flex-1 space-y-6">
                                        <div className="space-y-3">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Candidate Pipeline</p>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-bold text-muted-foreground italic">No candidates yet</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 pt-2">
                                            <Button
                                                variant="secondary"
                                                className="flex-1 rounded-xl font-black text-[10px] uppercase tracking-widest h-10 group/btn"
                                                onClick={() => copyInviteLink(template.inviteCode)}
                                            >
                                                {copiedCode === template.inviteCode ? (
                                                    <Check className="h-3 w-3 mr-2 text-emerald-500" />
                                                ) : (
                                                    <Copy className="h-3 w-3 mr-2 group-hover/btn:scale-110 transition-transform" />
                                                )}
                                                {copiedCode === template.inviteCode ? "Copied" : "Invite Link"}
                                            </Button>
                                            <Button
                                                onClick={() => navigate(`/job/${template._id}/results`)}
                                                className="flex-1 rounded-xl font-black text-[10px] uppercase tracking-widest h-10 shadow-lg glow-primary"
                                            >
                                                View Results <ChevronRight className="h-3 w-3 ml-1" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            {/* Create Template Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
                    <Card className="glass border-white/10 w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl rounded-3xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <CardHeader className="p-6 sm:p-7 pb-4 border-b border-white/5 shrink-0">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/10 p-2.5 rounded-xl border border-primary/20 text-primary">
                                        <Briefcase className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl sm:text-2xl font-black tracking-tight">New Job Posting</CardTitle>
                                        <CardDescription className="text-xs font-medium text-muted-foreground mt-0.5">
                                            Define the core parameters for candidate screening.
                                        </CardDescription>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsModalOpen(false)}
                                    className="h-8 w-8 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 sm:p-7 overflow-y-auto flex-1 space-y-5">
                            <form id="create-template-form" onSubmit={handleCreateTemplate} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-black uppercase tracking-wider text-muted-foreground/80 ml-0.5">
                                        Interview Track
                                    </label>
                                    <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-white/[0.03] border border-white/10">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, category: "technical" })}
                                            className={cn(
                                                "h-10 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-black transition-all",
                                                formData.category === "technical"
                                                    ? "btn-premium text-white shadow-md glow-primary"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                            )}
                                        >
                                            <Laptop className="h-4 w-4" />
                                            <span>Technical & Coding</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const nextFormat = formData.questionFormat === "coding" ? "blend" : formData.questionFormat;
                                                setFormData({ ...formData, category: "behavioral", questionFormat: nextFormat });
                                            }}
                                            className={cn(
                                                "h-10 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-black transition-all",
                                                formData.category === "behavioral"
                                                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                            )}
                                        >
                                            <Users className="h-4 w-4" />
                                            <span>HR & Behavioral</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-black uppercase tracking-wider text-muted-foreground/80 ml-0.5">
                                        Job Title
                                    </label>
                                    <Input
                                        placeholder={formData.category === "behavioral" ? "e.g. Senior Talent Partner" : "e.g. Senior Frontend Engineer"}
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="h-11 rounded-xl bg-white/5 border-white/10 focus:border-primary/50 text-sm font-medium"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-black uppercase tracking-wider text-muted-foreground/80 ml-0.5">
                                            Main Role
                                        </label>
                                        <Input
                                            placeholder={formData.category === "behavioral" ? "e.g. People & Culture" : "e.g. Frontend"}
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            className="h-11 rounded-xl bg-white/5 border-white/10 focus:border-primary/50 text-sm font-medium"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-black uppercase tracking-wider text-muted-foreground/80 ml-0.5">
                                            Core Topic
                                        </label>
                                        <Input
                                            placeholder={formData.category === "behavioral" ? "e.g. Leadership & Values" : "e.g. React & TypeScript"}
                                            value={formData.topic}
                                            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                            className="h-11 rounded-xl bg-white/5 border-white/10 focus:border-primary/50 text-sm font-medium"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-black uppercase tracking-wider text-muted-foreground/80 ml-0.5">
                                            Difficulty
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={formData.difficulty}
                                                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                                className="w-full h-11 px-3.5 pr-8 rounded-xl bg-white/5 border border-white/10 text-sm font-medium focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all appearance-none cursor-pointer text-foreground [&>option]:bg-zinc-900 [&>option]:text-foreground"
                                            >
                                                <option value="beginner">Beginner Level</option>
                                                <option value="intermediate">Intermediate</option>
                                                <option value="professional">Professional / Hard</option>
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-black uppercase tracking-wider text-muted-foreground/80 ml-0.5">
                                            Questions
                                        </label>
                                        <Input
                                            type="number"
                                            min="1"
                                            max="30"
                                            value={formData.totalQuestions}
                                            onChange={(e) => setFormData({ ...formData, totalQuestions: parseInt(e.target.value) || 10 })}
                                            className="h-11 rounded-xl bg-white/5 border-white/10 focus:border-primary/50 text-sm font-medium"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-black uppercase tracking-wider text-muted-foreground/80 ml-0.5">
                                        Question Style & Format
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={formData.questionFormat}
                                            onChange={(e) => setFormData({ ...formData, questionFormat: e.target.value })}
                                            className="w-full h-11 px-3.5 pr-8 rounded-xl bg-white/5 border border-white/10 text-sm font-medium focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all appearance-none cursor-pointer text-foreground [&>option]:bg-zinc-900 [&>option]:text-foreground"
                                        >
                                            {formData.category === "behavioral" ? (
                                                <>
                                                    <option value="blend">🌟 AI Blend (Situational MCQs + STAR Scenarios)</option>
                                                    <option value="mcq">📝 Situational MCQs (Scenario Judgment)</option>
                                                    <option value="conceptual">💬 STAR Scenarios (Behavioral & Leadership)</option>
                                                </>
                                            ) : (
                                                <>
                                                    <option value="blend">🌟 Dynamic AI Blend (MCQs + Code + Theory)</option>
                                                    <option value="mcq">📝 MCQ Focused (Multiple-Choice Quizzes)</option>
                                                    <option value="coding">💻 Coding Focused (Hands-on Programming)</option>
                                                    <option value="conceptual">💬 Conceptual (Deep Architecture & Theory)</option>
                                                </>
                                            )}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-black uppercase tracking-wider text-muted-foreground/80 ml-0.5">
                                        Description (Optional)
                                    </label>
                                    <Textarea
                                        placeholder="Brief overview of expectations for candidates..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full min-h-[72px] p-3 rounded-xl bg-white/5 border border-white/10 text-sm font-medium focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all resize-none"
                                    />
                                </div>

                                <div className="flex gap-3 pt-3 border-t border-white/5">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 h-11 rounded-xl font-bold uppercase tracking-wider text-xs border border-white/10 hover:bg-white/5"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isCreating}
                                        className="flex-1 h-11 rounded-xl btn-premium text-white font-black uppercase tracking-wider text-xs shadow-xl glow-primary"
                                    >
                                        {isCreating ? "Creating..." : "Launch Posting"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
