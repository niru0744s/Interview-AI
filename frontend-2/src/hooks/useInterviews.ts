import { useState, useEffect, useCallback } from "react";
import api from "../lib/axios";

export type Interview = {
  _id: string;
  status: string;
  role?: string;
  totalQuestions?: number;
};

export function useInterviews() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [creating, setCreating] = useState<boolean>(false);

  const fetchInterviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<Interview[] | { data: Interview[] }>("/interview");
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : [];
      setInterviews(data);
    } catch (error) {
      console.error("Failed to load interviews", error);
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  const startInterview = async (payload: { role: string; topic: string; totalQuestions: number }) => {
    setCreating(true);
    try {
      const res = await api.post<{ interviewId: string }>("/interview/start", payload);
      return res.data.interviewId;
    } catch (error) {
      console.error("Failed to start interview", error);
      throw error;
    } finally {
      setCreating(false);
    }
  };

  return {
    interviews,
    loading,
    creating,
    startInterview,
    refresh: fetchInterviews
  };
}
