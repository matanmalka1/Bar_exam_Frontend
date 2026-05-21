import { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../components/Button";
import Card from "../components/Card";
import ErrorState from "../components/ErrorState";
import FixedFooter from "../components/FixedFooter";
import OptionCard from "../components/OptionCard";
import AppLoader from "../components/loader";
import { useExamSession } from "../features/sessions/hooks/useExamSession";
import type { AnswerOption } from "../features/sessions/types";

const OPTIONS: AnswerOption[] = ["א", "ב", "ג", "ד"];

const NETWORK_ERR = "החיבור נכשל. נסה שוב";

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
    <div className="mx-auto w-full max-w-[720px] space-y-4 p-4 pb-24">
      <header className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/")}>
          חזרה
        </Button>
        <div className="text-center">
          <p className="text-sm font-semibold text-secondary">
            שאלה {currentIndex + 1} מתוך {total}
          </p>
          <p className="text-xs text-secondary">
            נענו: {answeredCount}/{total}
          </p>
        </div>
        <Button
          variant="ghost"
          className="min-h-10 px-3 py-2 text-sm"
          disabled={bookmarkBusy}
          onClick={toggleBookmark}
        >
          {bookmarkBusy ? (
            <AppLoader variant="button" label="מעדכן..." />
          ) : isBookmarked ? (
            "הסר סימניה"
          ) : (
            "סימניה"
          )}
        </Button>
      </header>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-beige-strong)]">
        <div
          className="h-full bg-[var(--accent)] transition-all"
          style={{ width: `${(answeredCount / Math.max(total, 1)) * 100}%` }}
        />
      </div>

      {actionError && (
        <Card className="border-2 border-strong bg-white">
          <p className="text-sm text-primary font-semibold">{actionError}</p>
        </Card>
      )}

      {bookmarkError && (
        <Card className="border-2 border-strong bg-white">
          <p className="text-sm text-primary font-semibold">{bookmarkError}</p>
        </Card>
      )}

      <Card className="surface-muted">
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
            onClick={() => selectAnswer(opt)}
          />
        ))}
      </div>

      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" onClick={prev} disabled={currentIndex === 0}>
          הקודמת
        </Button>
        <Button
          variant="ghost"
          onClick={next}
          disabled={isLast || !answerSubmitted}
        >
          הבאה
        </Button>
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
