import { useEffect, useReducer } from "react";
import { getReviewQuestions } from "../api";
import type { ReviewQuestion } from "../types";

type Status = "idle" | "loading" | "ready" | "error";

type State = { status: "ready"; questions: ReviewQuestion[] }
  | { status: "error"; questions: ReviewQuestion[] }
  | { status: "idle" | "loading"; questions: [] };

type Action =
  | { type: "ready"; questions: ReviewQuestion[] }
  | { type: "error" };

const reduce = (_: State, action: Action): State => {
  if (action.type === "ready") return { status: "ready", questions: action.questions };
  return { status: "error", questions: [] };
};

export const useReview = (examDate: string | null, part: "B" | "C" | null) => {
  const [state, dispatch] = useReducer(reduce, { status: "idle", questions: [] });
  const [reloadKey, setReloadKey] = useReducer((n: number) => n + 1, 0);

  useEffect(() => {
    if (!examDate || !part) return;

    let cancelled = false;

    getReviewQuestions(examDate, part)
      .then((data) => {
        if (!cancelled) dispatch({ type: "ready", questions: data });
      })
      .catch(() => {
        if (!cancelled) dispatch({ type: "error" });
      });

    return () => {
      cancelled = true;
    };
  }, [examDate, part, reloadKey]);

  const status: Status = !examDate || !part ? "idle" : state.status === "idle" ? "loading" : state.status;

  const retry = () => setReloadKey();

  return { status, questions: state.questions, retry };
};
