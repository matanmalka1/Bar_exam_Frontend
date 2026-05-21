import { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Alert from "../components/Alert";
import AppHeader from "../components/AppHeader";
import BookmarkButton from "../components/BookmarkButton";
import Button from "../components/Button";
import ErrorState from "../components/ErrorState";
import FixedFooter from "../components/FixedFooter";
import OptionCard from "../components/OptionCard";
import AppLoader from "../components/loader";
import { useExamSession } from "../features/sessions/hooks/useExamSession";
import type { AnswerOption } from "../features/sessions/types";
import { tap } from "../lib/haptics";

const OPTIONS: AnswerOption[] = ["א", "ב", "ג", "ד"];

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
          message="החיבור נכשל. נסה שוב"
          action={<Button onClick={retry}>נסה שוב</Button>}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[720px] p-4 pb-32">
      <AppHeader
        back={{ onClick: () => navigate("/") }}
        eyebrow={EXAM_MODE_LABEL}
        progress={{ current: currentIndex + 1, total, answered: answeredCount }}
        actions={
          <BookmarkButton
            isBookmarked={isBookmarked}
            busy={bookmarkBusy}
            onToggle={toggleBookmark}
          />
        }
      />

      {actionError && (
        <Alert variant="error" className="mb-4">
          {actionError}
        </Alert>
      )}
      {bookmarkError && (
        <Alert variant="error" className="mb-4">
          {bookmarkError}
        </Alert>
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
            <Button fullWidth disabled={primaryDisabled} onClick={() => { tap(); submitOrNext(); }}>
              {submitting ? (
                <AppLoader variant="button" label="שומר..." />
              ) : (
                primaryLabel
              )}
            </Button>
            {primaryReason && (
              <p className="text-center text-xs text-secondary">{primaryReason}</p>
            )}
          </>
        )}
        {showComplete && (
          <>
            <Button
              fullWidth
              disabled={!allAnswered || completing}
              onClick={() => { tap(); complete(); }}
            >
              {completing ? (
                <AppLoader variant="button" label="מסיים..." />
              ) : (
                "סיום בחינה"
              )}
            </Button>
            {completeReason && (
              <p className="text-center text-xs text-secondary">{completeReason}</p>
            )}
          </>
        )}
      </FixedFooter>
    </div>
  );
};

export default ExamSessionPage;
