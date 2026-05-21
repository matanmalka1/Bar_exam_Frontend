import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Check, ChevronLeft, ChevronRight, X } from "lucide-react";
import Button from "../components/Button";
import ErrorState from "../components/ErrorState";
import FixedFooter from "../components/FixedFooter";
import OptionCard from "../components/OptionCard";
import SessionTopBar from "../components/SessionTopBar";
import AppLoader from "../components/loader";
import {
  addBookmark,
  getBookmarks,
  removeBookmark,
} from "../features/bookmarks/api";
import {
  completeSession,
  getPracticeSession,
  submitAnswer,
} from "../features/sessions/api";
import type {
  AnswerOption,
  AnswerPracticeOut,
  AnswerResult,
  SessionDetail,
  SessionQuestion,
} from "../features/sessions/types";
import { cn } from "../lib/cn";

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

const isPracticeResult = (result: AnswerResult): result is AnswerPracticeOut =>
  "is_correct" in result;

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
  const [bookmarkIds, setBookmarkIds] = useState<Set<string>>(() => new Set());
  const [bookmarkBusy, setBookmarkBusy] = useState(false);
  const [bookmarkError, setBookmarkError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getPracticeSession(id)
      .then((data) => {
        if (cancelled) return;
        if (data.mode === "exam" || data.mode === "simulation") {
          navigate(`/session/${id}/exam`, { replace: true });
          return;
        }
        setSession(data);
        setCurrentIndex(findFirstUnansweredIndex(data.questions));
        setStatus("ready");
        getBookmarks()
          .then((items) => {
            if (!cancelled) {
              setBookmarkIds(new Set(items.map((item) => item.stable_id)));
            }
          })
          .catch(() => {
            if (!cancelled) setBookmarkIds(new Set());
          });
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

  const resetTransient = () => {
    setSelected(null);
    setSubmitError(null);
    setBookmarkError(null);
  };

  const retry = () => {
    setStatus("loading");
    setBookmarkError(null);
    setReloadKey((k) => k + 1);
  };

  if (status === "loading") {
    return <AppLoader variant="page" label="טוען נתונים..." />;
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

  const questionsCount = session.questions.length;
  const total = questionsCount || session.total_questions;
  const answeredCount = session.questions.filter((q) => q.answer).length;
  const allAnswered = questionsCount > 0 && answeredCount >= questionsCount;
  const isLast = currentIndex === questionsCount - 1;
  const answered = current.answer;
  const answerSubmitted = answered !== null;
  const isBookmarked = bookmarkIds.has(current.stable_id);

  const handleSelect = (opt: AnswerOption) => {
    if (answerSubmitted || submitting) return;
    setSelected(opt);
    setBookmarkError(null);
  };

  const handleToggleBookmark = async () => {
    if (bookmarkBusy) return;
    setBookmarkError(null);
    setBookmarkBusy(true);
    try {
      if (isBookmarked) {
        await removeBookmark(current.stable_id);
        setBookmarkIds((ids) => {
          const next = new Set(ids);
          next.delete(current.stable_id);
          return next;
        });
      } else {
        await addBookmark(current.stable_id);
        setBookmarkIds((ids) => new Set(ids).add(current.stable_id));
      }
    } catch {
      setBookmarkError("לא ניתן לעדכן סימניה כרגע");
    } finally {
      setBookmarkBusy(false);
    }
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
      if (!isPracticeResult(result)) {
        throw new Error("Expected practice answer result");
      }
      // Server answer wins. Patch the current question with server result.
      setSession((s) => {
        if (!s) return s;
        const updated = s.questions.map((q, i) =>
          i === currentIndex
            ? {
                ...q,
                answer: {
                  selected_answer: result.selected_answer,
                  is_correct: result.is_correct,
                  answered_at: result.answered_at,
                },
                correct_answer:
                  result.correct_answer ?? q.correct_answer ?? null,
                reference: result.reference ?? q.reference ?? null,
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

  const modeLabel = (() => {
    if (session.mode === "mistakes") return "חזרה על טעויות";
    if (session.mode === "bookmarks") return "תרגול סימניות";
    if (session.part === "B") return "תרגול · דין דיוני";
    if (session.part === "C") return "תרגול · דין מהותי";
    return "תרגול חופשי";
  })();

  return (
    <div className="mx-auto w-full max-w-[720px] p-4 pb-32">
      <SessionTopBar
        modeLabel={modeLabel}
        currentIndex={currentIndex}
        total={total}
        answeredCount={answeredCount}
        isBookmarked={isBookmarked}
        bookmarkBusy={bookmarkBusy}
        onBack={() => navigate("/")}
        onToggleBookmark={handleToggleBookmark}
      />

      {(submitError || bookmarkError) && (
        <div className="mb-4 space-y-2">
          {submitError && (
            <div
              role="alert"
              className="rounded-2xl border-2 border-strong bg-white px-4 py-3"
            >
              <p className="text-sm font-semibold text-primary">
                {submitError}
              </p>
            </div>
          )}
          {bookmarkError && (
            <div
              role="alert"
              className="rounded-2xl border-2 border-strong bg-white px-4 py-3"
            >
              <p className="text-sm font-semibold text-primary">
                {bookmarkError}
              </p>
            </div>
          )}
        </div>
      )}

      <article className="rounded-3xl border border-default bg-[var(--surface-muted)] p-5 shadow-[var(--shadow-default)]">
        <div className="flex items-baseline justify-between gap-2 border-b border-black/10 pb-3">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-[10px] uppercase tracking-[0.22em] text-secondary">
              שאלה
            </span>
            <span className="font-display text-xs font-bold tabular-nums text-[var(--accent-ink)]">
              #{current.number}
            </span>
          </div>
          {isBookmarked && (
            <span className="font-display text-[10px] uppercase tracking-[0.22em] text-secondary">
              שמורה
            </span>
          )}
        </div>
        <p className="mt-4 whitespace-pre-wrap text-[17px] leading-[1.85] text-primary">
          {current.body}
        </p>
      </article>

      {answerSubmitted && practiceAnswer && (
        <p
          role="status"
          aria-live="polite"
          className={cn(
            "mt-4 inline-flex items-center gap-2 text-sm font-semibold",
            practiceAnswer.is_correct ? "text-primary" : "text-primary",
          )}
        >
          {practiceAnswer.is_correct ? (
            <>
              <Check className="h-4 w-4" strokeWidth={2.6} />
              <span>תשובה נכונה.</span>
            </>
          ) : (
            <>
              <X className="h-4 w-4" strokeWidth={2.6} />
              <span>
                התשובה הנכונה היא{" "}
                <span className="font-display font-black">
                  {correctAnswer ?? ""}
                </span>
                .
              </span>
            </>
          )}
        </p>
      )}

      <div className="mt-4 grid gap-2.5">
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
        <section className="mt-6 border-t border-default pt-4">
          <p className="font-display text-[10px] uppercase tracking-[0.22em] text-secondary">
            הפניה
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-primary">
            {current.reference}
          </p>
        </section>
      )}

      <div className="mt-6 flex items-center justify-between border-t border-default pt-3">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="focus-ring inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-secondary transition hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
          הקודמת
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={isLast || !answerSubmitted}
          className="focus-ring inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-secondary transition hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
        >
          הבאה
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <FixedFooter>
        {!answerSubmitted && (
          <>
            <Button
              fullWidth
              disabled={submitCtaDisabled}
              onClick={handleSubmit}
            >
              {submitting ? (
                <AppLoader variant="button" label="שומר..." />
              ) : (
                "בדוק תשובה"
              )}
            </Button>
            {submitCtaReason && (
              <p className="text-center text-xs text-secondary">
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
              {completing ? (
                <AppLoader variant="button" label="מסיים..." />
              ) : (
                "סיום תרגול"
              )}
            </Button>
            {completeDisabledReason && (
              <p className="text-center text-xs text-secondary">
                {completeDisabledReason}
              </p>
            )}
          </>
        )}
      </FixedFooter>
    </div>
  );
};

export default SessionPage;
