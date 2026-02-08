import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { useAuth } from "../context/AuthContext";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "../lib/axios";
import { useNavigate } from "react-router-dom";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "../components/ui/alert-dialog";

export default function Settings() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [deleting, setDeleting] = useState(false);

    const handleDeleteAccount = async () => {
        setDeleting(true);
        try {
            await api.delete("/auth/delete");
            toast.success("Account deleted successfully.");
            logout();
            navigate("/");
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to delete account");
            setDeleting(false);
        }
    };

    return (
        <div className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto space-y-8">
            <div className="space-y-2">
                <h1 className="text-4xl font-black tracking-tight text-white">Settings</h1>
                <p className="text-muted-foreground text-lg">Manage your account preferences and data.</p>
            </div>

            <div className="grid gap-8">
                {/* Account Information Section (Read-only for now) */}
                <Card className="glass-card border-white/10">
                    <CardHeader>
                        <CardTitle>Account Information</CardTitle>
                        <CardDescription>Your current account details.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-1">
                            <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                            <div className="p-3 rounded-lg bg-white/5 border border-white/5 font-mono text-sm">
                                {user?.email}
                            </div>
                        </div>
                        <div className="grid gap-1">
                            <label className="text-sm font-medium text-muted-foreground">Current Role</label>
                            <div className="p-3 rounded-lg bg-white/5 border border-white/5 font-mono text-sm capitalize">
                                {user?.role}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-destructive/20 bg-destructive/5 overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-destructive flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            Danger Zone
                        </CardTitle>
                        <CardDescription className="text-destructive/70">
                            Irreversible actions for your account.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-destructive/10 border border-destructive/10">
                            <div className="space-y-1">
                                <h4 className="font-bold text-destructive">Delete Account</h4>
                                <p className="text-sm text-destructive/80 max-w-md">
                                    Permanently remove your account and all associated data (interviews, results, templates). This action cannot be undone.
                                </p>
                            </div>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" className="font-bold shadow-lg shadow-destructive/20">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Account
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="glass-card border-destructive/20">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="text-destructive font-black text-xl">Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription className="text-muted-foreground">
                                            This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="border-white/10 hover:bg-white/5">Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleDeleteAccount}
                                            className="bg-destructive hover:bg-destructive/90 text-white font-bold"
                                            disabled={deleting}
                                        >
                                            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Yes, delete my account"}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
