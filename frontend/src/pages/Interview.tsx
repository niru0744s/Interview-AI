import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import api from "../lib/axios";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";


const Interview = () => {
    const { interviewId } = useParams();
    const navigate = useNavigate();

    const [question, setQuestion] = useState(null);
    const [answer, setAnswer] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string|null>(null);

    useEffect(() => {
        const fetchQuestion = async () => {
            try {
                const res = await api.get(`/interviews/${interviewId}/next`);

                if (!res.data || !res.data.question) {
                    navigate(`/summary/${interviewId}`);
                    return;
                }

                setQuestion(res.data);
            } catch (err) {
                console.error(err);
                setError("Failed to load question");
            } finally {
                setLoading(false);
            }
        };

        fetchQuestion();
    }, [interviewId, navigate]);

    const handleSubmit = async () => {
        if (!answer.trim() || !question?.questionId) return;

        try {
            setSubmitting(true);

            await api.post(`/interviews/${interviewId}/answer`, {
                questionId: question.questionId,
                answer
            });

            setAnswer("");
            setQuestion(null);
            setLoading(true);

            const res = await api.get(`/interviews/${interviewId}/next`);

            if (!res.data || !res.data.question) {
                navigate(`/summary/${interviewId}`);
                return;
            }

            setQuestion(res.data);
        } catch (err) {
            console.error(err);
            alert("Failed to submit answer");
        } finally {
            setSubmitting(false);
            setLoading(false);
        }
    };

    const handleQuit = async () => {
        try {
            await api.post(`/interviews/${interviewId}/quit`);
            navigate("/interviews");
        } catch (err) {
            alert("Failed to quit interview");
        }
    };


    if (loading) {
        return <div className="p-6">Loading question...</div>;
    }

    if (error) {
        return <div className="p-6 text-red-500">{error}</div>;
    }

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-6">
            <h2 className="text-xl font-semibold">Interview Question</h2>

            <div className="border rounded p-4">
                <p className="whitespace-pre-wrap">
                    {question?.question || "No question available"}
                </p>
            </div>

            <Textarea
                placeholder="Type your answer here..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={6}
            />

            <div className="flex justify-between">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="outline">Quit Interview</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Quit interview?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Your progress will be saved, but this interview cannot be resumed.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleQuit}>
                                Quit
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <Button
                    onClick={handleSubmit}
                    disabled={submitting || !answer.trim()}
                >
                    {submitting ? "Submitting..." : "Submit Answer"}
                </Button>
            </div>

        </div>
    );
};

export default Interview;