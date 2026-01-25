import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "../ui/card";
import { cn } from "../../lib/utils";
import { PREDEFINED_ROLES, TOPICS_MAPPING } from "../../utils/constants";
import ResumeUpload from "./ResumeUpload";
import { Target, FileText, ChevronLeft, Rocket, Briefcase, Zap } from "lucide-react";
import { toast } from "sonner";

interface InterviewConfigDialogProps {
    onCancel: () => void;
    onLaunch: (payload: { role: string; topic: string; totalQuestions: number; resumeFile: File | null; resumeText: string }) => void;
    isCreating: boolean;
}

type SetupMode = "selection" | "choice" | "resume";

export default function InterviewConfigDialog({ onCancel, onLaunch, isCreating }: InterviewConfigDialogProps) {
    const [mode, setMode] = useState<SetupMode>("selection");
    const [selectedRole, setSelectedRole] = useState<string>(PREDEFINED_ROLES[0]);
    const [customRole, setCustomRole] = useState<string>("");
    const [selectedTopic, setSelectedTopic] = useState<string>(TOPICS_MAPPING[PREDEFINED_ROLES[0]][0]);
    const [customTopic, setCustomTopic] = useState<string>("");
    const [totalQuestions, setTotalQuestions] = useState<number>(10);
    const [resumeData, setResumeData] = useState<{ file: File | null; text: string }>({ file: null, text: "" });

    const handleLaunch = () => {
        let finalRole = "";
        let finalTopic = "";

        if (mode === "choice") {
            finalRole = selectedRole === "Other" ? customRole : selectedRole;
            finalTopic = selectedTopic === "Custom" ? customTopic : selectedTopic;
        } else {
            // For resume mode, we can use placeholder or try to infer from resume if needed
            // Backend currently expects role and topic
            finalRole = "Experience Based";
            finalTopic = "Resume Profile";
        }

        if (!finalRole.trim()) {
            toast.warning("Please specify a target role");
            return;
        }
        if (!finalTopic.trim()) {
            toast.warning("Please specify a technical focus");
            return;
        }

        onLaunch({
            role: finalRole,
            topic: finalTopic,
            totalQuestions,
            resumeFile: resumeData.file,
            resumeText: resumeData.text
        });
    };

    const renderSelection = () => (
        <div className="grid gap-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="text-center space-y-2 mb-4">
                <h2 className="text-3xl font-black tracking-tight">Pick Your Path</h2>
                <p className="text-muted-foreground">How would you like the AI to interview you today?</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
                <button
                    onClick={() => setMode("choice")}
                    className="group relative flex flex-col items-center text-center p-8 rounded-3xl border-2 border-white/10 glass hover:border-primary/50 hover:bg-primary/5 transition-all outline-none focus:ring-2 ring-primary"
                >
                    <div className="bg-blue-500/10 p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                        <Target className="h-8 w-8 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Custom Choice</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                        Target specific domains like Frontend React or Backend Node.js.
                    </p>
                    <div className="mt-6 flex items-center text-xs font-black uppercase tracking-widest text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        Configure <Rocket className="ml-2 h-3 w-3" />
                    </div>
                </button>

                <button
                    onClick={() => setMode("resume")}
                    className="group relative flex flex-col items-center text-center p-8 rounded-3xl border-2 border-white/10 glass hover:border-primary/50 hover:bg-primary/5 transition-all outline-none focus:ring-2 ring-primary"
                >
                    <div className="bg-purple-500/10 p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                        <FileText className="h-8 w-8 text-purple-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Project Based</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                        Focus on your actual projects and experience from your CV.
                    </p>
                    <div className="mt-6 flex items-center text-xs font-black uppercase tracking-widest text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        Upload <Rocket className="ml-2 h-3 w-3" />
                    </div>
                </button>
            </div>
        </div>
    );

    const renderChoiceSetup = () => (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                    <Briefcase className="h-3 w-3" /> Target Role
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PREDEFINED_ROLES.map((r) => (
                        <Button
                            key={r}
                            variant={selectedRole === r ? "default" : "outline"}
                            className={cn(
                                "h-auto py-3 px-4 text-xs justify-center font-bold transition-all rounded-xl border-white/10",
                                selectedRole === r && "btn-premium text-white border-transparent"
                            )}
                            onClick={() => {
                                setSelectedRole(r);
                                if (r !== "Other") {
                                    setSelectedTopic(TOPICS_MAPPING[r][0]);
                                }
                            }}
                        >
                            {r}
                        </Button>
                    ))}
                </div>
                {selectedRole === "Other" && (
                    <Input
                        placeholder="Enter your custom role..."
                        value={customRole}
                        onChange={(e) => setCustomRole(e.target.value)}
                        className="h-12 bg-background/50 border-white/10 rounded-xl"
                    />
                )}
            </div>

            <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                    <Zap className="h-3 w-3" /> Technical focus
                </Label>
                <div className="flex flex-wrap gap-2">
                    {(TOPICS_MAPPING[selectedRole] || TOPICS_MAPPING["Other"]).map((t) => (
                        <Button
                            key={t}
                            variant={selectedTopic === t ? "secondary" : "outline"}
                            className={cn(
                                "rounded-full px-4 h-9 text-xs font-black border-white/10 transition-all uppercase tracking-wider",
                                selectedTopic === t && "bg-primary text-black border-primary scale-105"
                            )}
                            onClick={() => setSelectedTopic(t)}
                        >
                            {t}
                        </Button>
                    ))}
                </div>
                {selectedTopic === "Custom" && (
                    <Input
                        placeholder="Specify custom focus (e.g. AWS Lambda)..."
                        value={customTopic}
                        onChange={(e) => setCustomTopic(e.target.value)}
                        className="h-12 bg-background/50 border-white/10 rounded-xl"
                    />
                )}
            </div>

            {renderCommonSetup()}
        </div>
    );

    const renderResumeSetup = () => (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            <ResumeUpload onResumeData={setResumeData} />
            {renderCommonSetup()}
        </div>
    );

    const renderCommonSetup = () => (
        <div className="space-y-3 pt-4 border-t border-white/5">
            <div className="flex justify-between items-center">
                <Label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60">Session Length</Label>
                <span className="text-xs font-black text-primary uppercase">{totalQuestions} Questions</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
                {[5, 10, 15, 20].map((num) => (
                    <Button
                        key={num}
                        type="button"
                        variant={totalQuestions === num ? "default" : "outline"}
                        className={cn(
                            "h-11 text-sm font-black border-white/10 rounded-xl",
                            totalQuestions === num && "btn-premium text-white border-transparent"
                        )}
                        onClick={() => setTotalQuestions(num)}
                    >
                        {num}
                    </Button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="max-w-xl mx-auto p-6">
            <Card className="glass border-white/10 shadow-2xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-br from-primary/10 via-transparent to-transparent pb-8">
                    <div className="flex items-center gap-4 mb-2">
                        {mode !== "selection" && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setMode("selection")}
                                className="h-8 w-8 rounded-full hover:bg-white/10"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                        )}
                        <div>
                            <CardTitle className="text-2xl font-black tracking-tight">
                                {mode === "selection" ? "Interview Config" : mode === "choice" ? "Custom Setup" : "Project Focus"}
                            </CardTitle>
                            <CardDescription className="font-medium">
                                Preparing for your next big opportunity
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="pt-4">
                    {mode === "selection" && renderSelection()}
                    {mode === "choice" && renderChoiceSetup()}
                    {mode === "resume" && renderResumeSetup()}
                </CardContent>

                {mode !== "selection" && (
                    <CardFooter className="flex gap-4 p-6 border-t border-white/5 bg-white/5">
                        <Button
                            variant="ghost"
                            className="flex-1 h-12 text-sm font-bold uppercase tracking-widest rounded-xl hover:bg-white/5"
                            onClick={onCancel}
                            disabled={isCreating}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-[2] h-12 text-sm font-black uppercase tracking-widest rounded-xl btn-premium text-white shadow-xl glow-primary"
                            onClick={handleLaunch}
                            disabled={isCreating}
                        >
                            {isCreating ? "Waking AI..." : "Launch Session"}
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}
