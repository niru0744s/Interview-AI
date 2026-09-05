import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import api from "../lib/axios";
import { useSocketStateMachine } from "../hooks/useSocketStateMachine";
import InterviewHeader from "../components/interview/InterviewHeader";
import InterviewLiveArea from "../components/interview/InterviewLiveArea";
import { toast } from "sonner";
import { cn } from "../lib/utils";

type InterviewQuestion = {
  questionId: string;
  question: string;
  type?: "conceptual" | "mcq" | "multi_choice" | "code";
  options?: string[];
  codeTemplate?: string | null;
  language?: string | null;
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

  const [question, setQuestion] = useState<InterviewQuestion | null>(null);
  const [details, setDetails] = useState<InterviewDetails | null>(null);
  const [answer, setAnswer] = useState<string>("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [code, setCode] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("javascript");
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [skipping, setSkipping] = useState<boolean>(false);
  const [cooldown, setCooldown] = useState<boolean>(false);
  const [optimisticAnswer, setOptimisticAnswer] = useState<string | null>(null);

  const { status, socket, error: socketError } = useSocketStateMachine(
    import.meta.env.VITE_BACKEND_URL,
    Boolean(interviewId)
  );

  const fetchDetails = useCallback(async () => {
    if (!interviewId) return;
    try {
      const res = await api.get(`/interview/${interviewId}/resume`);
      setDetails({
        role: res.data.role,
        topic: res.data.topic,
        totalQuestions: res.data.totalQuestions,
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
      setAnswer("");
      setSelectedOptions([]);
      if (data.question.type === "code") {
        setCode(data.question.codeTemplate || "");
        setSelectedLanguage(data.question.language || "javascript");
      } else {
        setCode("");
      }
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
      toast.error(msg);
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

  const isQuestionAnswered = useCallback((): boolean => {
    if (!question) return false;
    if (question.type === "mcq") {
      return selectedOptions.length === 1;
    }
    if (question.type === "multi_choice") {
      return selectedOptions.length > 0;
    }
    if (question.type === "code") {
      return code.trim().length > 0;
    }
    return answer.trim().length > 0;
  }, [question, selectedOptions, code, answer]);

  const handleSubmit = async (): Promise<void> => {
    if (!interviewId || !question || !socket || submitting || skipping || !isQuestionAnswered()) return;

    let submittedText = "";
    const payload: {
      interviewId: string;
      questionId: string;
      answer: string;
      selectedOptions?: string[];
      code?: string;
      language?: string;
    } = {
      interviewId,
      questionId: question.questionId,
      answer: "",
    };

    if (question.type === "mcq" || question.type === "multi_choice") {
      submittedText = selectedOptions.join(", ");
      payload.answer = submittedText;
      payload.selectedOptions = selectedOptions;
    } else if (question.type === "code") {
      submittedText = code;
      payload.answer = code;
      payload.code = code;
      payload.language = selectedLanguage;
    } else {
      submittedText = answer.trim();
      payload.answer = submittedText;
    }

    setOptimisticAnswer(submittedText);
    setSubmitting(true);
    setLoading(true); // Lock the UI

    socket.emit(
      "submit_answer",
      payload,
      (ack: { status: string; message?: string }) => {
        setSubmitting(false);
        if (ack.status === "error") {
          toast.error(ack.message || "Failed to submit answer");
          if (question.type === "code") {
            setCode(submittedText);
          } else if (question.type === "mcq" || question.type === "multi_choice") {
            setSelectedOptions(payload.selectedOptions || []);
          } else {
            setAnswer(submittedText);
          }
          setOptimisticAnswer(null);
          setLoading(false); // Unlock if error
        } else {
          setQuestion(null);
          setAnswer("");
          setSelectedOptions([]);
          setCode("");
        }
      }
    );
  };

  const handleSkip = async (): Promise<void> => {
    if (!interviewId || !socket || !question || skipping || submitting || cooldown) return;

    setSkipping(true);
    setLoading(true); // Lock the UI
    setOptimisticAnswer("Skipping question...");
    socket.emit("skip_question", { interviewId });
    setAnswer("");
    setSelectedOptions([]);
    setCode("");
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

  if (socketError) {
    return (
      <div className="p-6 text-red-500 text-center">
        <h3 className="text-lg font-bold">Error</h3>
        <p>{socketError}</p>
        <Button className="mt-4" onClick={() => window.location.reload()}>
          Retry Connection
        </Button>
      </div>
    );
  }

  const canSubmit =
    !submitting &&
    !skipping &&
    !loading &&
    !cooldown &&
    isQuestionAnswered() &&
    status === "CONNECTED";

  return (
    <div
      className={cn(
        "mx-auto p-4 sm:p-6 space-y-6 transition-all duration-500",
        question?.type === "code" ? "max-w-7xl" : "max-w-3xl"
      )}
    >
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
        questionType={question?.type || "conceptual"}
        options={question?.options}
        codeTemplate={question?.codeTemplate}
        language={question?.language}
        answer={answer}
        setAnswer={setAnswer}
        selectedOptions={selectedOptions}
        setSelectedOptions={setSelectedOptions}
        code={code}
        setCode={setCode}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
        submitting={submitting}
        skipping={skipping || cooldown}
        canSubmit={canSubmit}
        onSubmit={handleSubmit}
        onSkip={handleSkip}
        onQuit={handleQuit}
      />
    </div>
  );
}
