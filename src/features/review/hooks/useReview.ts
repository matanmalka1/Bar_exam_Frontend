import { useEffect, useState } from "react";
import { getReviewQuestions } from "../api";
import type { ReviewQuestion } from "../types";

type Status = "idle" | "loading" | "ready" | "error";

export const useReview = (examDate: string | null, part: "B" | "C" | null) => {
  const [status, setStatus] = useState<Status>("idle");
  const [questions, setQuestions] = useState<ReviewQuestion[]>([]);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!examDate || !part) {
      setStatus("idle");
      setQuestions([]);
      return;
    }

    let cancelled = false;
    setStatus("loading");

    getReviewQuestions(examDate, part)
      .then((data) => {
        if (cancelled) return;
        setQuestions(data);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [examDate, part, reloadKey]);

  const retry = () => {
    setStatus("loading");
    setReloadKey((k) => k + 1);
  };

  return { status, questions, retry };
};
