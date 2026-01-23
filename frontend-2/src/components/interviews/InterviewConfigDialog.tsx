import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../ui/card";
import { cn } from "../../lib/utils";
import { PREDEFINED_ROLES, TOPICS_MAPPING } from "../../utils/constants";

interface InterviewConfigDialogProps {
    onCancel: () => void;
    onLaunch: (payload: { role: string; topic: string; totalQuestions: number }) => void;
    isCreating: boolean;
}

export default function InterviewConfigDialog({ onCancel, onLaunch, isCreating }: InterviewConfigDialogProps) {
    const [selectedRole, setSelectedRole] = useState<string>(PREDEFINED_ROLES[0]);
    const [customRole, setCustomRole] = useState<string>("");
    const [selectedTopic, setSelectedTopic] = useState<string>(TOPICS_MAPPING[PREDEFINED_ROLES[0]][0]);
    const [customTopic, setCustomTopic] = useState<string>("");
    const [totalQuestions, setTotalQuestions] = useState<number>(10);

    const handleLaunch = () => {
        const finalRole = selectedRole === "Other" ? customRole : selectedRole;
        const finalTopic = selectedTopic === "Custom" ? customTopic : selectedTopic;

        if (!finalRole.trim()) {
            alert("Please specify a role");
            return;
        }
        if (!finalTopic.trim()) {
            alert("Please specify a topic");
            return;
        }

        onLaunch({
            role: finalRole,
            topic: finalTopic,
            totalQuestions
        });
    };

    return (
        <div className="max-w-xl mx-auto p-6">
            <Card className="shadow-lg border-2">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Configure Your Interview</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Customize your session for the best AI feedback.
                    </p>
                </CardHeader>
                <CardContent className="space-y-8 pt-4">
                    {/* Role Selection */}
                    <div className="space-y-3">
                        <Label className="text-base font-bold">What role are you targeting?</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {PREDEFINED_ROLES.map((r) => (
                                <Button
                                    key={r}
                                    variant={selectedRole === r ? "default" : "outline"}
                                    className={cn(
                                        "h-auto py-3 px-4 text-sm justify-start font-medium transition-all text-left whitespace-normal",
                                        selectedRole === r && "ring-2 ring-primary ring-offset-2"
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
                            <div className="pt-2 animate-in fade-in slide-in-from-top-1">
                                <Input
                                    placeholder="Enter your custom role..."
                                    value={customRole}
                                    onChange={(e) => setCustomRole(e.target.value)}
                                    className="h-11"
                                />
                            </div>
                        )}
                    </div>

                    {/* Topic Selection */}
                    <div className="space-y-3">
                        <Label className="text-base font-bold">Technical Focus</Label>
                        <div className="flex flex-wrap gap-2">
                            {(TOPICS_MAPPING[selectedRole] || TOPICS_MAPPING["Other"]).map((t) => (
                                <Button
                                    key={t}
                                    variant={selectedTopic === t ? "secondary" : "outline"}
                                    className={cn(
                                        "rounded-full px-4 h-9 text-xs font-semibold border-2 transition-all",
                                        selectedTopic === t ? "bg-primary text-primary-foreground border-primary" : "hover:border-primary/50"
                                    )}
                                    onClick={() => setSelectedTopic(t)}
                                >
                                    {t}
                                </Button>
                            ))}
                        </div>
                        {selectedTopic === "Custom" && (
                            <div className="pt-2 animate-in fade-in slide-in-from-top-1">
                                <Input
                                    placeholder="Specify custom focus (e.g. AWS Lambda)..."
                                    value={customTopic}
                                    onChange={(e) => setCustomTopic(e.target.value)}
                                    className="h-11"
                                />
                            </div>
                        )}
                    </div>

                    {/* Question Count */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <Label className="text-base font-bold">Session Length</Label>
                            <span className="text-sm font-medium text-muted-foreground">{totalQuestions} Questions</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {[5, 10, 15, 20].map((num) => (
                                <Button
                                    key={num}
                                    type="button"
                                    variant={totalQuestions === num ? "default" : "outline"}
                                    className="h-11 text-base font-bold"
                                    onClick={() => setTotalQuestions(num)}
                                >
                                    {num}
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex gap-3 pt-6">
                    <Button
                        variant="ghost"
                        className="flex-1 h-12 text-base"
                        onClick={onCancel}
                        disabled={isCreating}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="flex-2 px-8 h-12 text-base font-bold shadow-md"
                        onClick={handleLaunch}
                        disabled={isCreating}
                    >
                        {isCreating ? "Preparing..." : "Launch Interview"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
