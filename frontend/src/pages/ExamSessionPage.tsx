import { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "../components/Button";
import ErrorState from "../components/ErrorState";
import FixedFooter from "../components/FixedFooter";
import OptionCard from "../components/OptionCard";
import SessionTopBar from "../components/SessionTopBar";
import AppLoader from "../components/loader";
import { useExamSession } from "../features/sessions/hooks/useExamSession";
import type { AnswerOption } from "../features/sessions/types";

const OPTIONS: AnswerOption[] = ["א", "ב", "ג", "ד"];

const NETWORK_ERR = "החיבור נכשל. נסה שוב";
const EXAM_MODE_LABEL = "מצב בחינה · ללא משוב";

const ExamSessionPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const handleRedirectToPractice = useCallback(
    (sessionId: string) => {
      navigate(`/session/${sessionId}`, { replace: true });
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
    actionError,
    bookmarkBusy,
    bookmarkError,
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
  } = useExamSession({
    sessionId: id,
    onRedirectToPractice: handleRedirectToPractice,
    onComplete: handleCompleteRedirect,
  });

  if (status === "loading") {
    return <AppLoader variant="page" label="טוען נתונים..." />;
  }

  if (status === "error" || !current) {
    return (
      <div className="mx-auto w-full max-w-[720px] p-4">
        <ErrorState
          message={NETWORK_ERR}
          action={<Button onClick={retry}>נסה שוב</Button>}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[720px] p-4 pb-32">
      <SessionTopBar
        modeLabel={EXAM_MODE_LABEL}
        currentIndex={currentIndex}
        total={total}
        answeredCount={answeredCount}
        isBookmarked={isBookmarked}
        bookmarkBusy={bookmarkBusy}
        onBack={() => navigate("/")}
        onToggleBookmark={toggleBookmark}
      />

      {(actionError || bookmarkError) && (
        <div className="mb-4 space-y-2">
          {actionError && (
            <div
              role="alert"
              className="rounded-2xl border-2 border-strong bg-white px-4 py-3"
            >
              <p className="text-sm font-semibold text-primary">
                {actionError}
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

      <div className="mt-4 grid gap-2.5">
        {OPTIONS.map((opt) => (
          <OptionCard
            key={opt}
            mode="exam"
            label={opt}
            text={current.options[opt]}
            selected={displaySelected === opt}
            disabled={submitting || answerSubmitted}
            onClick={() => selectAnswer(opt)}
          />
        ))}
      </div>

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
        {!showComplete && (
          <>
            <Button fullWidth disabled={primaryDisabled} onClick={submitOrNext}>
              {submitting ? (
                <AppLoader variant="button" label="שומר..." />
              ) : (
                primaryLabel
              )}
            </Button>
            {primaryReason && (
              <p className="text-center text-xs text-secondary">
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
              onClick={complete}
            >
              {completing ? (
                <AppLoader variant="button" label="מסיים..." />
              ) : (
                "סיום בחינה"
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

export default ExamSessionPage;
