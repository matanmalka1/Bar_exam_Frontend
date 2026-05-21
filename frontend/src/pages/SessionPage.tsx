import { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Check, ChevronLeft, ChevronRight, X } from "lucide-react";
import AppHeader from "../components/AppHeader";
import BookmarkButton from "../components/BookmarkButton";
import Button from "../components/Button";
import ErrorState from "../components/ErrorState";
import FixedFooter from "../components/FixedFooter";
import OptionCard from "../components/OptionCard";
import AppLoader from "../components/loader";
import { usePracticeSession } from "../features/sessions/hooks/usePracticeSession";
import type { AnswerOption } from "../features/sessions/types";
import { cn } from "../lib/cn";
import { tap } from "../lib/haptics";

const OPTIONS: AnswerOption[] = ["א", "ב", "ג", "ד"];

const SessionPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const handleRedirectToExam = useCallback(
    (sessionId: string) => {
      navigate(`/session/${sessionId}/exam`, { replace: true });
    },
    [navigate],
  );

  const handleCompleteRedirect = useCallback(
    (sessionId: string) => {
      navigate(`/session/${sessionId}/results`);
    },
    [navigate],
  );

  const {
    status,
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
  } = usePracticeSession({
    sessionId: id,
    onRedirectToExam: handleRedirectToExam,
    onComplete: handleCompleteRedirect,
  });

  if (status === "loading") {
    return <AppLoader variant="page" label="טוען נתונים..." />;
  }

  if (status === "error" || !current) {
    return (
      <div className="mx-auto w-full max-w-[720px] p-4">
        <ErrorState
          message="החיבור נכשל. נסה שוב"
          action={<Button onClick={retry}>נסה שוב</Button>}
        />
      </div>
    );
  }

  const answered = current.answer;

  return (
    <div className="mx-auto w-full max-w-[720px] p-4 pb-32">
      <AppHeader
        back={{ onClick: () => navigate("/") }}
        eyebrow={modeLabel}
        progress={{ current: currentIndex + 1, total, answered: answeredCount }}
        actions={
          <BookmarkButton
            isBookmarked={isBookmarked}
            busy={bookmarkBusy}
            onToggle={toggleBookmark}
          />
        }
      />

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
            : displaySelected === opt;
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
              onClick={() => selectAnswer(opt)}
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
          onClick={prev}
          disabled={currentIndex === 0}
          className="focus-ring inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-secondary transition hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
          הקודמת
        </button>
        <button
          type="button"
          onClick={next}
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
              disabled={submitDisabled}
              onClick={() => {
                tap();
                submit();
              }}
            >
              {submitting ? (
                <AppLoader variant="button" label="שומר..." />
              ) : (
                "בדוק תשובה"
              )}
            </Button>
            {submitReason && (
              <p className="text-center text-xs text-secondary">
                {submitReason}
              </p>
            )}
          </>
        )}

        {answerSubmitted && !isLast && (
          <Button
            fullWidth
            onClick={() => {
              tap();
              next();
            }}
          >
            שאלה הבאה
          </Button>
        )}

        {answerSubmitted && isLast && (
          <>
            <Button
              fullWidth
              disabled={!allAnswered || completing}
              onClick={() => {
                tap();
                complete();
              }}
            >
              {completing ? (
                <AppLoader variant="button" label="מסיים..." />
              ) : (
                "סיום תרגול"
              )}
            </Button>
            {completeReason && (
              <p className="text-center text-xs text-secondary">
                {completeReason}
              </p>
            )}
          </>
        )}
      </FixedFooter>
    </div>
  );
};

export default SessionPage;
