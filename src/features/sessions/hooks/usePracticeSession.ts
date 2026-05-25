import { useCallback, useMemo, useRef, useState } from "react";
import { notifyError, notifySuccess } from "../../../lib/toast";
import { completeSession, submitAnswer } from "../api";
import { isExamLike } from "../types";
import type {
  AnswerOption,
  AnswerPracticeOut,
  AnswerResult,
  SessionDetail,
  SessionQuestion,
} from "../types";
import { useSessionBookmarks } from "./useSessionBookmarks";
import { findFirstUnansweredIndex, useSessionLoader } from "./useSessionLoader";
import { useSessionNavigation } from "./useSessionNavigation";

const SUBMIT_ERR = "לא ניתן לשמור תשובה. נסה שוב";
const COMPLETE_ERR = "לא ניתן לסיים את התרגול כרגע";

type PracticeAnswer = NonNullable<SessionQuestion["answer"]> & {
  scoring_status: "correct" | "incorrect" | "invalidated";
};

const isPracticeAnswer = (
  answer: SessionQuestion["answer"],
): answer is PracticeAnswer =>
  answer !== null &&
  answer.scoring_status !== null &&
  answer.scoring_status !== undefined;

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
  const total = questionsCount || session?.total_questions || 0;
  const isLast = currentIndex === questionsCount - 1;

  const validate = useCallback(
    (data: SessionDetail, sid: string) => {
      if (isExamLike(data.mode)) {
        onRedirectToExam(sid);
        return false;
      }
      return true;
    },
    [onRedirectToExam],
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

  const current = useMemo<SessionQuestion | null>(
    () => session?.questions[currentIndex] ?? null,
    [session, currentIndex],
  );

  const answeredCount =
    session?.questions.filter((q) => q.answer).length ?? 0;
  const allAnswered = questionsCount > 0 && answeredCount >= questionsCount;
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

  const next = useCallback(() => navNext(questionsCount), [navNext, questionsCount]);

  const selectAnswer = useCallback(
    (option: AnswerOption) => {
      if (submitting || answerSubmitted) return;
      setSelected((prev) => (prev === option ? null : option));
    },
    [answerSubmitted, submitting, setSelected],
  );

  const toggleBookmark = useCallback(async () => {
    if (!current || bookmarkBusy) return;
    await toggleBookmarkById(current.stable_id, isBookmarked);
  }, [bookmarkBusy, current, isBookmarked, toggleBookmarkById]);

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
                  scoring_status: result.scoring_status,
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
      notifyError(SUBMIT_ERR);
      setSelected(null);
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }, [current, selected, sessionId, setSelected, submitting]);

  const complete = useCallback(async () => {
    if (!allAnswered || !sessionId || completing || completingRef.current) {
      return;
    }

    completingRef.current = true;
    setCompleting(true);
    try {
      await completeSession(sessionId);
      notifySuccess("התרגול הסתיים בהצלחה");
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
