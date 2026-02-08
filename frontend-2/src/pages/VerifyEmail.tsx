import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../lib/axios";
import { Loader2, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
    const [message, setMessage] = useState("Verifying your email...");

    const runOnce = useRef(false);

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("Invalid verification link.");
            return;
        }

        if (runOnce.current) return;
        runOnce.current = true;

        const verify = async () => {
            try {
                await api.get(`/auth/verify-email?token=${token}`);
                setStatus("success");
                setMessage("Email verified successfully! You can now login.");
            } catch (err: any) {
                setStatus("error");
                setMessage(err.response?.data?.error || "Verification failed. Link may be expired.");
            }
        };

        verify();
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
            <Card className="max-w-md w-full glass-card border-white/10 shadow-2xl">
                <CardHeader className="text-center pb-2">
                    <div className="flex justify-center mb-4">
                        {status === "verifying" && <Loader2 className="h-12 w-12 text-primary animate-spin" />}
                        {status === "success" && <CheckCircle className="h-12 w-12 text-green-500" />}
                        {status === "error" && <XCircle className="h-12 w-12 text-destructive" />}
                    </div>
                    <CardTitle className="text-2xl font-black tracking-tight">
                        {status === "verifying" && "Verifying Email"}
                        {status === "success" && "Verified!"}
                        {status === "error" && "Verification Failed"}
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-6">
                    <p className="text-muted-foreground font-medium text-lg">
                        {message}
                    </p>
                    {status !== "verifying" && (
                        <Button
                            onClick={() => navigate("/login")}
                            className="w-full h-12 rounded-xl font-bold text-md btn-premium glow-primary text-white"
                        >
                            Go to Login <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
