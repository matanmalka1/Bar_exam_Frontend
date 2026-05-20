import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../components/Button";
import Card from "../components/Card";
import ErrorState from "../components/ErrorState";
import OptionCard from "../components/OptionCard";
import {
  completeSession,
  getPracticeSession,
  submitAnswer,
} from "../features/sessions/api";
import type {
  AnswerOption,
  AnswerPracticeOut,
  SessionDetail,
  SessionQuestion,
} from "../features/sessions/types";

type Status = "loading" | "ready" | "error";

const OPTIONS: AnswerOption[] = ["א", "ב", "ג", "ד"];

const NETWORK_ERR = "החיבור נכשל. נסה שוב";
const SUBMIT_ERR = "לא ניתן לשמור תשובה. נסה שוב";
const COMPLETE_ERR = "לא ניתן לסיים את התרגול כרגע";

const findFirstUnansweredIndex = (qs: SessionQuestion[]): number => {
  const idx = qs.findIndex((q) => q.answer === null);
  return idx === -1 ? qs.length - 1 : idx;
};

const isPracticeAnswer = (
  a: SessionQuestion["answer"],
): a is NonNullable<SessionQuestion["answer"]> & { is_correct: boolean } =>
  a !== null && typeof a.is_correct === "boolean";

const SessionPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [status, setStatus] = useState<Status>("loading");
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<AnswerOption | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getPracticeSession(id)
      .then((data) => {
        if (cancelled) return;
        setSession(data);
        setCurrentIndex(findFirstUnansweredIndex(data.questions));
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  const current = useMemo<SessionQuestion | null>(
    () => session?.questions[currentIndex] ?? null,
    [session, currentIndex],
  );

  const resetTransient = () => {
    setSelected(null);
    setSubmitError(null);
  };

  const retry = () => {
    setStatus("loading");
    setReloadKey((k) => k + 1);
  };

  if (status === "loading") {
    return (
      <div className="mx-auto w-full max-w-[720px] p-4">
        <p className="text-gray-600">טוען…</p>
      </div>
    );
  }

  if (status === "error" || !session || !current) {
    return (
      <div className="mx-auto w-full max-w-[720px] p-4">
        <ErrorState
          message={NETWORK_ERR}
          action={<Button onClick={retry}>נסה שוב</Button>}
        />
      </div>
    );
  }

  const total = session.total_questions;
  const questionsCount = session.questions.length;
  const answeredCount = session.questions.filter((q) => q.answer).length;
  const allAnswered = answeredCount === total;
  const isLast = currentIndex === questionsCount - 1;
  const answered = current.answer;
  const answerSubmitted = answered !== null;

  const handleSelect = (opt: AnswerOption) => {
    if (answerSubmitted || submitting) return;
    setSelected(opt);
  };

  const handleSubmit = async () => {
    if (!selected || !id) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      const result = await submitAnswer(id, {
        stable_id: current.stable_id,
        selected_answer: selected,
      });
      const practiceResult = result as AnswerPracticeOut;
      // Server answer wins. Patch the current question with server result.
      setSession((s) => {
        if (!s) return s;
        const updated = s.questions.map((q, i) =>
          i === currentIndex
            ? {
                ...q,
                answer: {
                  selected_answer: practiceResult.selected_answer,
                  is_correct: practiceResult.is_correct ?? null,
                  answered_at: practiceResult.answered_at,
                },
                correct_answer:
                  practiceResult.correct_answer ?? q.correct_answer ?? null,
                reference: practiceResult.reference ?? q.reference ?? null,
              }
            : q,
        );
        const newAnswered = updated.filter((q) => q.answer).length;
        return { ...s, questions: updated, answered_count: newAnswered };
      });
    } catch {
      setSubmitError(SUBMIT_ERR);
      // Per invariant: never navigate after failed answer save.
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < questionsCount - 1) {
      setCurrentIndex((i) => i + 1);
      resetTransient();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      resetTransient();
    }
  };

  const handleComplete = async () => {
    if (!allAnswered || !id) return;
    setSubmitError(null);
    setCompleting(true);
    try {
      await completeSession(id);
      navigate(`/session/${id}/results`);
    } catch {
      setSubmitError(COMPLETE_ERR);
    } finally {
      setCompleting(false);
    }
  };

  const correctAnswer = current.correct_answer ?? null;
  const practiceAnswer = isPracticeAnswer(answered) ? answered : null;

  const submitCtaDisabled = !selected || submitting;
  const submitCtaReason = !selected ? "בחר תשובה" : null;

  const completeDisabledReason = !allAnswered
    ? `יש לענות על כל ${total} השאלות לפני סיום`
    : null;

  return (
    <div className="mx-auto w-full max-w-[720px] p-4 pb-32 space-y-4">
      <header className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/")}>
          חזרה
        </Button>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">
            שאלה {currentIndex + 1} מתוך {total}
          </p>
          <p className="text-xs text-gray-500">
            נענו: {answeredCount}/{total}
          </p>
        </div>
        <span className="w-16" />
      </header>

      <div className="h-1 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full bg-blue-600 transition-all"
          style={{ width: `${(answeredCount / Math.max(total, 1)) * 100}%` }}
        />
      </div>

      {submitError && (
        <Card className="border-red-200 bg-red-50">
          <p className="text-sm text-red-700">{submitError}</p>
        </Card>
      )}

      <Card>
        <p className="text-xs text-gray-500">שאלה {current.number}</p>
        <p className="mt-2 whitespace-pre-wrap text-base leading-relaxed text-gray-900">
          {current.body}
        </p>
      </Card>

      <div className="grid gap-2">
        {OPTIONS.map((opt) => {
          const text = current.options[opt];
          const isSelected = answered
            ? answered.selected_answer === opt
            : selected === opt;
          const showCorrectness = answerSubmitted;
          const isCorrect =
            showCorrectness && correctAnswer !== null && opt === correctAnswer;
          const isWrong =
            showCorrectness &&
            practiceAnswer !== null &&
            practiceAnswer.is_correct === false &&
            opt === practiceAnswer.selected_answer;
          return (
            <OptionCard
              key={opt}
              mode="practice"
              label={opt}
              text={text}
              selected={isSelected}
              isCorrect={isCorrect}
              isWrong={isWrong}
              disabled={answerSubmitted || submitting}
              onClick={() => handleSelect(opt)}
            />
          );
        })}
      </div>

      {answerSubmitted && current.reference && (
        <Card className="border-gray-200 bg-gray-50">
          <p className="text-xs font-medium text-gray-600">הפניה</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-gray-800">
            {current.reference}
          </p>
        </Card>
      )}

      <div className="flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          הקודמת
        </Button>
        <Button
          variant="ghost"
          onClick={handleNext}
          disabled={isLast || !answerSubmitted}
        >
          הבאה
        </Button>
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-gray-200 bg-white p-3">
        <div className="mx-auto w-full max-w-[720px] space-y-1">
          {!answerSubmitted && (
            <>
              <Button
                fullWidth
                disabled={submitCtaDisabled}
                onClick={handleSubmit}
              >
                {submitting ? "שומר…" : "בדוק תשובה"}
              </Button>
              {submitCtaReason && (
                <p className="text-center text-xs text-gray-500">
                  {submitCtaReason}
                </p>
              )}
            </>
          )}

          {answerSubmitted && !isLast && (
            <Button fullWidth onClick={handleNext}>
              שאלה הבאה
            </Button>
          )}

          {answerSubmitted && isLast && (
            <>
              <Button
                fullWidth
                disabled={!allAnswered || completing}
                onClick={handleComplete}
              >
                {completing ? "מסיים…" : "סיום תרגול"}
              </Button>
              {completeDisabledReason && (
                <p className="text-center text-xs text-gray-500">
                  {completeDisabledReason}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionPage;
