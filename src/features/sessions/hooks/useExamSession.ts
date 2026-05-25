import { useCallback, useMemo, useRef, useState } from "react";
import { notifyError, notifySuccess } from "../../../lib/toast";
import { completeSession, submitAnswer } from "../api";
import { isExamLike } from "../types";
import type {
  AnswerExamOut,
  AnswerOption,
  SessionDetail,
  SessionQuestion,
} from "../types";
import { useSessionBookmarks } from "./useSessionBookmarks";
import { findFirstUnansweredIndex, useSessionLoader } from "./useSessionLoader";
import { useSessionNavigation } from "./useSessionNavigation";

type Status = "loading" | "ready" | "error";

const SUBMIT_ERR = "לא ניתן לשמור תשובה. נסה שוב";
const COMPLETE_ERR = "לא ניתן לסיים את הבחינה כרגע";

interface UseExamSessionOptions {
  sessionId: string | undefined;
  onRedirectToPractice: (sessionId: string) => void;
  onComplete: (sessionId: string) => void;
}

interface UseExamSessionResult {
  status: Status;
  sessionCompleted: boolean;
  questions: SessionQuestion[];
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
  complete: (force?: boolean) => Promise<void>;
  toggleBookmark: () => Promise<void>;
}

export const useExamSession = ({
  sessionId,
  onRedirectToPractice,
  onComplete,
}: UseExamSessionOptions): UseExamSessionResult => {
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [completing, setCompleting] = useState(false);
  const completingRef = useRef(false);
  const {
    bookmarkBusy,
    bookmarkIds,
    toggleBookmark: toggleBookmarkById,
  } = useSessionBookmarks();

  const {
    currentIndex,
    setCurrentIndex,
    selected,
    setSelected,
    next: navNext,
    prev,
  } = useSessionNavigation();

  const questionsCount = session?.questions.length ?? 0;
  const total = questionsCount;
  const answeredCount = session?.questions.filter((q) => q.answer).length ?? 0;
  const activeQuestions =
    session?.questions.filter((q) => q.status !== "invalidated") ?? [];
  const activeCount = activeQuestions.length;
  const activeAnsweredCount = activeQuestions.filter((q) => q.answer).length;
  const allAnswered = activeCount > 0 && activeAnsweredCount >= activeCount;
  const isLast = currentIndex === questionsCount - 1;

  const current = useMemo<SessionQuestion | null>(
    () => session?.questions[currentIndex] ?? null,
    [session, currentIndex],
  );

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
    ? `יש לענות על כל ${activeCount} השאלות הפעילות לפני סיום`
    : null;

  const next = useCallback(() => navNext(questionsCount), [navNext, questionsCount]);

  const validate = useCallback(
    (data: SessionDetail, sid: string) => {
      if (!isExamLike(data.mode)) {
        onRedirectToPractice(sid);
        return false;
      }
      if (
        data.questions.length === 0 ||
        data.questions.length !== data.total_questions
      ) {
        return false;
      }
      return true;
    },
    [onRedirectToPractice],
  );

  const onReady = useCallback(
    (data: SessionDetail) => {
      setSession(data);
      setCurrentIndex(findFirstUnansweredIndex(data.questions));
      setSelected(null);
    },
    [setCurrentIndex, setSelected],
  );

  const { status, retry } = useSessionLoader({ sessionId, validate, onReady });

  const selectAnswer = useCallback(
    (option: AnswerOption) => {
      if (submitting || answerSubmitted) return;
      setSelected((prev) => (prev === option ? null : option));
    },
    [answerSubmitted, submitting, setSelected],
  );

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
                  scoring_status: null,
                  answered_at: result.answered_at,
                },
              }
            : question,
        );

        return {
          ...existingSession,
          questions: updatedQuestions,
          answered_count: updatedQuestions.filter((q) => q.answer).length,
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

  const complete = useCallback(
    async (force = false) => {
      if (
        (!force && !allAnswered) ||
        !sessionId ||
        completing ||
        completingRef.current
      ) {
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
    },
    [allAnswered, completing, onComplete, sessionId],
  );

  return {
    status,
    sessionCompleted: session?.status === "completed",
    questions: session?.questions ?? [],
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
