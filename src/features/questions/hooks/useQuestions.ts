import { useEffect, useReducer } from "react";
import { getQuestions } from "../api";
import type { PracticeQuestion } from "../types";

type Status = "idle" | "loading" | "ready" | "error";

type State =
  | { status: "ready"; questions: PracticeQuestion[] }
  | { status: "error"; questions: [] }
  | { status: "idle" | "loading"; questions: [] };

type Action =
  | { type: "loading" }
  | { type: "ready"; questions: PracticeQuestion[] }
  | { type: "error" };

const reduce = (state: State, action: Action): State => {
  if (action.type === "loading") return { status: "loading", questions: [] };
  if (action.type === "ready") {
    return { status: "ready", questions: action.questions };
  }
  if (state.status === "idle") return { status: "idle", questions: [] };
  return { status: "error", questions: [] };
};

export const useQuestions = (
  examDate: string | null,
  part: "B" | "C" | null,
) => {
  const [state, dispatch] = useReducer(reduce, {
    status: "idle",
    questions: [],
  });
  const [reloadKey, retry] = useReducer((n: number) => n + 1, 0);

  useEffect(() => {
    if (!examDate || !part) return;

    let cancelled = false;
    dispatch({ type: "loading" });

    getQuestions(examDate, part)
      .then((questions) => {
        if (!cancelled) dispatch({ type: "ready", questions });
      })
      .catch(() => {
        if (!cancelled) dispatch({ type: "error" });
      });

    return () => {
      cancelled = true;
    };
  }, [examDate, part, reloadKey]);

  const status: Status = !examDate || !part ? "idle" : state.status;

  return { status, questions: state.questions, retry };
};
