import { useEffect, useReducer } from "react";
import { getQuestion, getQuestionForReview } from "../api";
import type { PracticeQuestion, ReviewQuestionDetail } from "../types";

type QuestionDetail = PracticeQuestion | ReviewQuestionDetail;
type Mode = "practice" | "review";
type Status = "loading" | "ready" | "error";

type State =
  | { status: "loading"; question: null }
  | { status: "ready"; question: QuestionDetail }
  | { status: "error"; question: null };

type Action =
  | { type: "loading" }
  | { type: "ready"; question: QuestionDetail }
  | { type: "error" };

const reduce = (_state: State, action: Action): State => {
  if (action.type === "loading") return { status: "loading", question: null };
  if (action.type === "ready") {
    return { status: "ready", question: action.question };
  }
  return { status: "error", question: null };
};

export const useQuestionDetail = (stableId: string | undefined, mode: Mode) => {
  const [state, dispatch] = useReducer(reduce, {
    status: "loading",
    question: null,
  });
  const [reloadKey, retry] = useReducer((n: number) => n + 1, 0);

  useEffect(() => {
    if (!stableId) {
      dispatch({ type: "error" });
      return;
    }

    let cancelled = false;
    dispatch({ type: "loading" });

    const request =
      mode === "review"
        ? getQuestionForReview(stableId)
        : getQuestion(stableId);

    request
      .then((question) => {
        if (!cancelled) dispatch({ type: "ready", question });
      })
      .catch(() => {
        if (!cancelled) dispatch({ type: "error" });
      });

    return () => {
      cancelled = true;
    };
  }, [stableId, mode, reloadKey]);

  return {
    status: state.status as Status,
    question: state.question,
    retry,
  };
};
