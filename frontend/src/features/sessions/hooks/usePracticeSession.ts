import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { addBookmark, getBookmarks, removeBookmark } from "../../bookmarks/api";
import { completeSession, getPracticeSession, submitAnswer } from "../api";
import type {
  AnswerOption,
  AnswerPracticeOut,
  AnswerResult,
  SessionDetail,
  SessionQuestion,
} from "../types";

type Status = "loading" | "ready" | "error";

const SUBMIT_ERR = "לא ניתן לשמור תשובה. נסה שוב";
const COMPLETE_ERR = "לא ניתן לסיים את התרגול כרגע";
const BOOKMARK_ERR = "לא ניתן לעדכן סימניה כרגע";

type PracticeAnswer = NonNullable<SessionQuestion["answer"]> & {
  is_correct: boolean;
};

const findFirstUnansweredIndex = (questions: SessionQuestion[]): number => {
  const index = questions.findIndex((question) => question.answer === null);
  return index === -1 ? Math.max(questions.length - 1, 0) : index;
};

const isPracticeAnswer = (
  answer: SessionQuestion["answer"],
): answer is PracticeAnswer =>
  answer !== null && typeof answer.is_correct === "boolean";

const isPracticeResult = (result: AnswerResult): result is AnswerPracticeOut =>
  "is_correct" in result;

interface UsePracticeSessionOptions {
  sessionId: string | undefined;
  onRedirectToExam: (sessionId: string) => void;
  onComplete: (sessionId: string) => void;
}

export const usePracticeSession = ({
  sessionId,
  onRedirectToExam,
  onComplete,
}: UsePracticeSessionOptions) => {
  const [status, setStatus] = useState<Status>("loading");
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<AnswerOption | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const completingRef = useRef(false);
  const [bookmarkIds, setBookmarkIds] = useState<Set<string>>(() => new Set());
  const [bookmarkBusy, setBookmarkBusy] = useState(false);
  const [bookmarkError, setBookmarkError] = useState<string | null>(null);

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
      setActionError(null);
      setBookmarkError(null);

      try {
        const data = await getPracticeSession(sessionId);
        if (cancelled) return;

        if (data.mode === "exam" || data.mode === "simulation") {
          onRedirectToExam(sessionId);
          return;
        }

        setSession(data);
        setCurrentIndex(findFirstUnansweredIndex(data.questions));
        setStatus("ready");

        try {
          const items = await getBookmarks();
          if (!cancelled) {
            setBookmarkIds(new Set(items.map((item) => item.stable_id)));
          }
        } catch {
          if (!cancelled) setBookmarkIds(new Set());
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    };

    void loadSession();

    return () => {
      cancelled = true;
    };
  }, [sessionId, onRedirectToExam, reloadKey]);

  const current = useMemo<SessionQuestion | null>(
    () => session?.questions[currentIndex] ?? null,
    [session, currentIndex],
  );

  const questionsCount = session?.questions.length ?? 0;
  const total = questionsCount || session?.total_questions || 0;
  const answeredCount =
    session?.questions.filter((question) => question.answer).length ?? 0;
  const allAnswered = questionsCount > 0 && answeredCount >= questionsCount;
  const isLast = currentIndex === questionsCount - 1;
  const answered = current?.answer ?? null;
  const answerSubmitted = answered !== null;
  const practiceAnswer = isPracticeAnswer(answered) ? answered : null;
  const correctAnswer = current?.correct_answer ?? null;
  const isBookmarked = current ? bookmarkIds.has(current.stable_id) : false;
  const displaySelected: AnswerOption | null = answered
    ? answered.selected_answer
    : selected;
  const submitDisabled = !selected || submitting;
  const submitReason = !selected ? "בחר תשובה" : null;
  const completeReason = !allAnswered
    ? `יש לענות על כל ${total} השאלות לפני סיום`
    : null;
  const modeLabel = (() => {
    if (session?.mode === "mistakes") return "חזרה על טעויות";
    if (session?.mode === "bookmarks") return "תרגול סימניות";
    if (session?.part === "B") return "תרגול · דין דיוני";
    if (session?.part === "C") return "תרגול · דין מהותי";
    return "תרגול חופשי";
  })();

  const clearTransientState = useCallback(() => {
    setSelected(null);
    setActionError(null);
    setBookmarkError(null);
  }, []);

  const retry = useCallback(() => {
    setStatus("loading");
    setSession(null);
    setCurrentIndex(0);
    setSelected(null);
    setActionError(null);
    setBookmarkError(null);
    setReloadKey((key) => key + 1);
  }, []);

  const selectAnswer = useCallback(
    (option: AnswerOption) => {
      if (submitting || answerSubmitted) return;
      setSelected(option);
      setBookmarkError(null);
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

    const stableId = current.stable_id;
    const nextBookmarked = !isBookmarked;
    setBookmarkError(null);
    setBookmarkBusy(true);
    setBookmarkIds((ids) => {
      const nextIds = new Set(ids);
      if (nextBookmarked) {
        nextIds.add(stableId);
      } else {
        nextIds.delete(stableId);
      }
      return nextIds;
    });

    try {
      if (nextBookmarked) {
        await addBookmark(stableId);
      } else {
        await removeBookmark(stableId);
      }
    } catch {
      setBookmarkIds((ids) => {
        const nextIds = new Set(ids);
        if (isBookmarked) {
          nextIds.add(stableId);
        } else {
          nextIds.delete(stableId);
        }
        return nextIds;
      });
      setBookmarkError(BOOKMARK_ERR);
    } finally {
      setBookmarkBusy(false);
    }
  }, [bookmarkBusy, current, isBookmarked]);

  const submit = useCallback(async () => {
    if (
      !sessionId ||
      !current ||
      !selected ||
      submitting ||
      submittingRef.current
    ) {
      return;
    }

    const answeredStableId = current.stable_id;
    setActionError(null);
    submittingRef.current = true;
    setSubmitting(true);
    try {
      const result = await submitAnswer(sessionId, {
        stable_id: answeredStableId,
        selected_answer: selected,
      });

      if (!isPracticeResult(result)) {
        throw new Error("Expected practice answer result");
      }

      setSession((existingSession) => {
        if (!existingSession) return existingSession;

        const updatedQuestions = existingSession.questions.map((question) =>
          question.stable_id === answeredStableId
            ? {
                ...question,
                answer: {
                  selected_answer: result.selected_answer,
                  is_correct: result.is_correct,
                  answered_at: result.answered_at,
                },
                correct_answer:
                  result.correct_answer ?? question.correct_answer ?? null,
                reference: result.reference ?? question.reference ?? null,
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
    } catch {
      setActionError(SUBMIT_ERR);
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }, [current, selected, sessionId, submitting]);

  const complete = useCallback(async () => {
    if (!allAnswered || !sessionId || completing || completingRef.current) {
      return;
    }

    setActionError(null);
    completingRef.current = true;
    setCompleting(true);
    try {
      await completeSession(sessionId);
      onComplete(sessionId);
    } catch {
      setActionError(COMPLETE_ERR);
    } finally {
      completingRef.current = false;
      setCompleting(false);
    }
  }, [allAnswered, completing, onComplete, sessionId]);

  return {
    status,
    current,
    currentIndex,
    submitting,
    completing,
    actionError,
    bookmarkBusy,
    bookmarkError,
    total,
    answeredCount,
    allAnswered,
    isLast,
    answerSubmitted,
    practiceAnswer,
    correctAnswer,
    isBookmarked,
    displaySelected,
    submitDisabled,
    submitReason,
    completeReason,
    modeLabel,
    retry,
    selectAnswer,
    submit,
    prev,
    next,
    complete,
    toggleBookmark,
  };
};
