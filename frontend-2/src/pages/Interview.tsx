import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import api from "../lib/axios";
import { useSocketStateMachine } from "../hooks/useSocketStateMachine";
import { useAuth } from "../context/AuthContext";
import InterviewHeader from "../components/interview/InterviewHeader";
import InterviewLiveArea from "../components/interview/InterviewLiveArea";
import { toast } from "sonner";

type InterviewQuestion = {
  questionId: string;
  question: string;
  currentIndex?: number;
  totalQuestions?: number;
};

type RouteParams = {
  interviewId: string;
};

type InterviewDetails = {
  role: string;
  topic: string;
  totalQuestions: number;
};

export default function Interview() {
  const { interviewId } = useParams<RouteParams>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [question, setQuestion] = useState<InterviewQuestion | null>(null);
  const [details, setDetails] = useState<InterviewDetails | null>(null);
  const [answer, setAnswer] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [skipping, setSkipping] = useState<boolean>(false);
  const [cooldown, setCooldown] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [optimisticAnswer, setOptimisticAnswer] = useState<string | null>(null);

  const { status, socket, error: socketError } = useSocketStateMachine(
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000",
    user?.token || null
  );

  const fetchDetails = useCallback(async () => {
    if (!interviewId) return;
    try {
      const res = await api.get(`/interview/${interviewId}/resume`);
      setDetails({
        role: res.data.role,
        topic: res.data.topic,
        totalQuestions: res.data.totalQuestions
      });
    } catch (err) {
      console.error("Failed to fetch interview details", err);
    }
  }, [interviewId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const fetchNextQuestion = useCallback(() => {
    if (socket && interviewId && status === "CONNECTED") {
      setLoading(true);
      socket.emit("next_question", { interviewId });
    }
  }, [socket, interviewId, status]);

  useEffect(() => {
    if (!socket || status !== "CONNECTED") return;

    socket.on("question", (data: { question: InterviewQuestion }) => {
      if (!data.question) {
        navigate(`/summary/${interviewId}`);
        return;
      }
      setQuestion(data.question);
      setOptimisticAnswer(null);
      setLoading(false);
      setSkipping(false);
      setSubmitting(false);

      // Prevent rapid fire clicking
      setCooldown(true);
      setTimeout(() => setCooldown(false), 1000);
    });

    socket.on("interview_completed", () => {
      navigate(`/summary/${interviewId}`);
    });

    socket.on("error", (msg: string) => {
      setError(msg);
      setSubmitting(false);
      setLoading(false);
      setOptimisticAnswer(null);
    });

    if (!question && !optimisticAnswer) {
      fetchNextQuestion();
    }

    return () => {
      socket.off("question");
      socket.off("interview_completed");
      socket.off("error");
    };
  }, [socket, status, interviewId, navigate, question, fetchNextQuestion, optimisticAnswer]);

  const handleSubmit = async (): Promise<void> => {
    if (!interviewId || !answer.trim() || !question || !socket || submitting || skipping) return;

    const submittedAnswer = answer.trim();
    setOptimisticAnswer(submittedAnswer);
    setAnswer("");
    setSubmitting(true);
    setLoading(true); // Lock the UI

    socket.emit(
      "submit_answer",
      {
        interviewId,
        questionId: question.questionId,
        answer: submittedAnswer,
      },
      (ack: { status: string; message?: string }) => {
        setSubmitting(false);
        if (ack.status === "error") {
          setError(ack.message || "Failed to submit answer");
          setAnswer(submittedAnswer);
          setOptimisticAnswer(null);
          setLoading(false); // Unlock if error
        } else {
          setQuestion(null);
        }
      }
    );
  };

  const handleSkip = async (): Promise<void> => {
    if (!interviewId || !socket || !question || skipping || submitting || cooldown) return;

    setSkipping(true);
    setLoading(true); // Lock the UI
    socket.emit("skip_question", { interviewId });
    setQuestion(null);
  };

  const handleQuit = async (): Promise<void> => {
    if (!interviewId) return;
    try {
      await api.post(`/interview/${interviewId}/quit`);
      toast.info("Session ended.");
      navigate("/interviews");
    } catch {
      toast.error("Failed to quit interview cleanly.");
    }
  };

  if (socketError || error) {
    return (
      <div className="p-6 text-red-500 text-center">
        <h3 className="text-lg font-bold">Error</h3>
        <p>{socketError || error}</p>
        <Button className="mt-4" onClick={() => window.location.reload()}>
          Retry Connection
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <InterviewHeader
        role={details?.role}
        topic={details?.topic}
        currentIndex={question?.currentIndex}
        totalQuestions={question?.totalQuestions || details?.totalQuestions}
        status={status}
      />

      <InterviewLiveArea
        loading={loading}
        optimisticAnswer={optimisticAnswer}
        question={question?.question}
        answer={answer}
        setAnswer={setAnswer}
        submitting={submitting}
        skipping={skipping || cooldown}
        canSubmit={!submitting && !skipping && !loading && !cooldown && !!answer.trim() && status === "CONNECTED"}
        onSubmit={handleSubmit}
        onSkip={handleSkip}
        onQuit={handleQuit}
      />
    </div>
  );
}
