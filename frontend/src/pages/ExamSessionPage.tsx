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
  AnswerExamOut,
  AnswerOption,
  SessionDetail,
  SessionQuestion,
} from "../features/sessions/types";

type Status = "loading" | "ready" | "error";

const OPTIONS: AnswerOption[] = ["א", "ב", "ג", "ד"];

const NETWORK_ERR = "החיבור נכשל. נסה שוב";
const SUBMIT_ERR = "לא ניתן לשמור תשובה. נסה שוב";
const COMPLETE_ERR = "לא ניתן לסיים את הבחינה כרגע";

const findFirstUnansweredIndex = (qs: SessionQuestion[]): number => {
  const idx = qs.findIndex((q) => q.answer === null);
  return idx === -1 ? qs.length - 1 : idx;
};

const ExamSessionPage = () => {
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
        if (data.mode !== "exam" && data.mode !== "simulation") {
          navigate(`/session/${id}`, { replace: true });
          return;
        }
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
  }, [id, navigate, reloadKey]);

  const current = useMemo<SessionQuestion | null>(
    () => session?.questions[currentIndex] ?? null,
    [session, currentIndex],
  );

  const retry = () => {
    setStatus("loading");
    setReloadKey((k) => k + 1);
  };

  if (status === "loading") {
    return (
      <div className="mx-auto w-full max-w-[720px] p-4">
        <p className="text-stone-600">טוען...</p>
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
  const displaySelected: AnswerOption | null = answered
    ? (answered.selected_answer as AnswerOption)
    : selected;

  const handleSelect = (opt: AnswerOption) => {
    if (submitting) return;
    setSelected(opt);
    setSubmitError(null);
  };

  const advance = () => {
    if (currentIndex < questionsCount - 1) {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
      setSubmitError(null);
    }
  };

  const handlePrimary = async () => {
    if (!id) return;
    if (answerSubmitted) {
      if (!isLast) advance();
      return;
    }
    if (!displaySelected) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      const result = (await submitAnswer(id, {
        stable_id: current.stable_id,
        selected_answer: displaySelected,
      })) as AnswerExamOut;
      setSession((s) => {
        if (!s) return s;
        const updated = s.questions.map((q, i) =>
          i === currentIndex
            ? {
                ...q,
                answer: {
                  selected_answer: result.selected_answer as AnswerOption,
                  is_correct: null,
                  answered_at: result.answered_at,
                },
              }
            : q,
        );
        const newAnswered = updated.filter((q) => q.answer).length;
        return { ...s, questions: updated, answered_count: newAnswered };
      });
      if (!isLast) advance();
    } catch {
      setSubmitError(SUBMIT_ERR);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setSelected(null);
      setSubmitError(null);
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

  const showComplete = isLast && answerSubmitted;
  const primaryDisabled = !answerSubmitted && (!displaySelected || submitting);
  const primaryLabel = submitting
    ? "שומר…"
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

  return (
    <div className="mx-auto w-full max-w-[720px] p-4 pb-32 space-y-4">
      <header className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/")}>
          חזרה
        </Button>
        <div className="text-center">
          <p className="text-sm font-semibold text-stone-700">
            שאלה {currentIndex + 1} מתוך {total}
          </p>
          <p className="text-xs text-stone-500">
            נענו: {answeredCount}/{total}
          </p>
        </div>
        <span className="w-16" />
      </header>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#e1d3be]">
        <div
          className="h-full bg-[var(--accent)] transition-all"
          style={{ width: `${(answeredCount / Math.max(total, 1)) * 100}%` }}
        />
      </div>

      {submitError && (
        <Card className="border-red-200 bg-red-50">
          <p className="text-sm text-red-700">{submitError}</p>
        </Card>
      )}

      <Card className="bg-[#fffaf1]">
        <p className="text-xs font-medium text-[var(--accent)]">
          שאלה {current.number}
        </p>
        <p className="mt-2 whitespace-pre-wrap text-base leading-8 text-[var(--ink)]">
          {current.body}
        </p>
      </Card>

      <div className="grid gap-2">
        {OPTIONS.map((opt) => (
          <OptionCard
            key={opt}
            mode="exam"
            label={opt}
            text={current.options[opt]}
            selected={displaySelected === opt}
            disabled={submitting || answerSubmitted}
            onClick={() => handleSelect(opt)}
          />
        ))}
      </div>

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
          onClick={advance}
          disabled={isLast || !answerSubmitted}
        >
          הבאה
        </Button>
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-[#e2d5c2] bg-white/90 p-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] shadow-[0_-10px_30px_rgba(79,31,64,0.08)] backdrop-blur">
        <div className="mx-auto w-full max-w-[720px] space-y-1">
          {!showComplete && (
            <>
              <Button
                fullWidth
                disabled={primaryDisabled}
                onClick={handlePrimary}
              >
                {primaryLabel}
              </Button>
              {primaryReason && (
                <p className="text-center text-xs text-gray-500">
                  {primaryReason}
                </p>
              )}
            </>
          )}
          {showComplete && (
            <>
              <Button
                fullWidth
                disabled={!allAnswered || completing}
                onClick={handleComplete}
              >
                {completing ? "מסיים…" : "סיום בחינה"}
              </Button>
              {completeReason && (
                <p className="text-center text-xs text-gray-500">
                  {completeReason}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamSessionPage;
