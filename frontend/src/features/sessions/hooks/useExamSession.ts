import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { notifyError, notifySuccess } from "../../../lib/toast";
import { completeSession, getPracticeSession, submitAnswer } from "../api";
import type {
  AnswerExamOut,
  AnswerOption,
  SessionDetail,
  SessionQuestion,
} from "../types";
import { useSessionBookmarks } from "./useSessionBookmarks";

type Status = "loading" | "ready" | "error";

const SUBMIT_ERR = "לא ניתן לשמור תשובה. נסה שוב";
const COMPLETE_ERR = "לא ניתן לסיים את הבחינה כרגע";

const findFirstUnansweredIndex = (questions: SessionQuestion[]): number => {
  const index = questions.findIndex((question) => question.answer === null);
  return index === -1 ? Math.max(questions.length - 1, 0) : index;
};

interface UseExamSessionOptions {
  sessionId: string | undefined;
  onRedirectToPractice: (sessionId: string) => void;
  onComplete: (sessionId: string) => void;
}

interface UseExamSessionResult {
  status: Status;
  sessionCompleted: boolean;
  current: SessionQuestion | null;
  currentIndex: number;
  submitting: boolean;
  completing: boolean;
  bookmarkBusy: boolean;
  total: number;
  answeredCount: number;
  allAnswered: boolean;
  isLast: boolean;
  answerSubmitted: boolean;
  isBookmarked: boolean;
  displaySelected: AnswerOption | null;
  showComplete: boolean;
  primaryDisabled: boolean;
  primaryLabel: string;
  primaryReason: string | null;
  completeReason: string | null;
  retry: () => void;
  selectAnswer: (option: AnswerOption) => void;
  submitOrNext: () => Promise<void>;
  prev: () => void;
  next: () => void;
  complete: () => Promise<void>;
  toggleBookmark: () => Promise<void>;
}

export const useExamSession = ({
  sessionId,
  onRedirectToPractice,
  onComplete,
}: UseExamSessionOptions): UseExamSessionResult => {
  const [status, setStatus] = useState<Status>("loading");
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<AnswerOption | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [completing, setCompleting] = useState(false);
  const completingRef = useRef(false);
  const {
    bookmarkBusy,
    bookmarkIds,
    loadBookmarks,
    toggleBookmark: toggleBookmarkById,
  } = useSessionBookmarks();

  useEffect(() => {
    let cancelled = false;

    const loadSession = async () => {
      if (!sessionId) {
        setStatus("error");
        return;
      }

      setStatus("loading");
      setSession(null);
      setSelected(null);

      try {
        const data = await getPracticeSession(sessionId);
        if (cancelled) return;

        if (data.mode !== "exam" && data.mode !== "simulation") {
          onRedirectToPractice(sessionId);
          return;
        }

        if (
          data.questions.length === 0 ||
          data.questions.length !== data.total_questions
        ) {
          setStatus("error");
          return;
        }

        setSession(data);
        setCurrentIndex(findFirstUnansweredIndex(data.questions));
        setStatus("ready");

        void loadBookmarks(() => cancelled);
      } catch {
        if (!cancelled) setStatus("error");
      }
    };

    void loadSession();

    return () => {
      cancelled = true;
    };
  }, [sessionId, onRedirectToPractice, reloadKey, loadBookmarks]);

  const current = useMemo<SessionQuestion | null>(
    () => session?.questions[currentIndex] ?? null,
    [session, currentIndex],
  );

  const questionsCount = session?.questions.length ?? 0;
  const total = questionsCount;
  const answeredCount =
    session?.questions.filter((question) => question.answer).length ?? 0;
  const allAnswered = questionsCount > 0 && answeredCount >= questionsCount;
  const isLast = currentIndex === questionsCount - 1;
  const answerSubmitted =
    current?.answer !== null && current?.answer !== undefined;
  const isBookmarked = current ? bookmarkIds.has(current.stable_id) : false;
  const displaySelected: AnswerOption | null = current?.answer
    ? current.answer.selected_answer
    : selected;
  const showComplete = isLast && answerSubmitted;
  const primaryDisabled = !answerSubmitted && (!displaySelected || submitting);
  const primaryLabel =
    answerSubmitted && isLast
      ? "סיום"
      : answerSubmitted
        ? "הבאה"
        : isLast
          ? "שמור תשובה"
          : "שמור והמשך";
  const primaryReason =
    !answerSubmitted && !displaySelected ? "בחר תשובה" : null;
  const completeReason = !allAnswered
    ? `יש לענות על כל ${total} השאלות לפני סיום`
    : null;

  const clearTransientState = useCallback(() => {
    setSelected(null);
  }, []);

  const retry = useCallback(() => {
    setStatus("loading");
    setSession(null);
    setCurrentIndex(0);
    setSelected(null);
    setReloadKey((key) => key + 1);
  }, []);

  const selectAnswer = useCallback(
    (option: AnswerOption) => {
      if (submitting || answerSubmitted) return;
      setSelected(option);
    },
    [answerSubmitted, submitting],
  );

  const next = useCallback(() => {
    if (currentIndex >= questionsCount - 1) return;
    setCurrentIndex((index) => index + 1);
    clearTransientState();
  }, [clearTransientState, currentIndex, questionsCount]);

  const prev = useCallback(() => {
    if (currentIndex <= 0) return;
    setCurrentIndex((index) => index - 1);
    clearTransientState();
  }, [clearTransientState, currentIndex]);

  const toggleBookmark = useCallback(async () => {
    if (!current || bookmarkBusy) return;
    await toggleBookmarkById(current.stable_id, isBookmarked, {
      optimistic: false,
    });
  }, [bookmarkBusy, current, isBookmarked, toggleBookmarkById]);

  const submitOrNext = useCallback(async () => {
    if (!sessionId || !current || submitting || submittingRef.current) return;

    if (answerSubmitted) {
      if (!isLast) next();
      return;
    }

    if (!displaySelected) return;

    const answeredStableId = current.stable_id;
    submittingRef.current = true;
    setSubmitting(true);
    try {
      const result = (await submitAnswer(sessionId, {
        stable_id: answeredStableId,
        selected_answer: displaySelected,
      })) as AnswerExamOut;

      setSession((existingSession) => {
        if (!existingSession) return existingSession;

        const updatedQuestions = existingSession.questions.map((question) =>
          question.stable_id === answeredStableId
            ? {
                ...question,
                answer: {
                  selected_answer: result.selected_answer,
                  is_correct: null,
                  answered_at: result.answered_at,
                },
              }
            : question,
        );

        return {
          ...existingSession,
          questions: updatedQuestions,
          answered_count: updatedQuestions.filter((question) => question.answer)
            .length,
        };
      });

      if (!isLast) next();
    } catch {
      notifyError(SUBMIT_ERR);
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }, [
    answerSubmitted,
    current,
    displaySelected,
    isLast,
    next,
    sessionId,
    submitting,
  ]);

  const complete = useCallback(async () => {
    if (!allAnswered || !sessionId || completing || completingRef.current) {
      return;
    }

    completingRef.current = true;
    setCompleting(true);
    try {
      await completeSession(sessionId);
      notifySuccess("הבחינה הסתיימה בהצלחה");
      onComplete(sessionId);
    } catch {
      notifyError(COMPLETE_ERR);
    } finally {
      completingRef.current = false;
      setCompleting(false);
    }
  }, [allAnswered, completing, onComplete, sessionId]);

  return {
    status,
    sessionCompleted: session?.status === "completed",
    current,
    currentIndex,
    submitting,
    completing,
    bookmarkBusy,
    total,
    answeredCount,
    allAnswered,
    isLast,
    answerSubmitted,
    isBookmarked,
    displaySelected,
    showComplete,
    primaryDisabled,
    primaryLabel,
    primaryReason,
    completeReason,
    retry,
    selectAnswer,
    submitOrNext,
    prev,
    next,
    complete,
    toggleBookmark,
  };
};
