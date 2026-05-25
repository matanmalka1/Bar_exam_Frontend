import { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Check, X } from "lucide-react";
import AppHeader from "../../../components/AppHeader";
import BookmarkButton from "../../../components/BookmarkButton";
import Button from "../../../components/Button";
import ConfirmSheet from "../../../components/ConfirmSheet";
import ErrorState from "../../../components/ErrorState";
import FixedFooter from "../../../components/FixedFooter";
import PageShell from "../../../components/PageShell";
import ReferenceBox from "../../../components/ReferenceBox";
import AppLoader from "../../../components/loader";
import QuestionNavigation from "../components/QuestionNavigation";
import SessionAnswerOptions from "../components/SessionAnswerOptions";
import SessionQuestionCard from "../components/SessionQuestionCard";
import TimerDisplay from "../components/TimerDisplay";
import { usePracticeSession } from "../hooks/usePracticeSession";
import { useSessionExitGuard } from "../hooks/useSessionExitGuard";
import { useElapsedTimer } from "../hooks/useTimer";
import { tap } from "../../../lib/haptics";

const AnswerFeedback = ({
  isCorrect,
  correctAnswer,
  scoringStatus,
}: {
  isCorrect?: boolean | null;
  correctAnswer: string | null;
  scoringStatus?: string | null;
}) => (
  <div
    role="status"
    aria-live="polite"
    className="rounded-2xl border border-default bg-[var(--surface-muted)] px-4 py-3 text-sm font-semibold text-primary"
  >
    <div className="flex items-center gap-2">
      {scoringStatus === "invalidated" ? (
        <>
          <Check className="h-4 w-4 shrink-0" strokeWidth={2.6} />
          <span>השאלה נפסלה, ולכן ניתנה עליה נקודה מלאה.</span>
        </>
      ) : isCorrect ? (
        <>
          <Check className="h-4 w-4 shrink-0" strokeWidth={2.6} />
          <span>תשובה נכונה.</span>
        </>
      ) : (
        <>
          <X className="h-4 w-4 shrink-0" strokeWidth={2.6} />
          <span>
            התשובה הנכונה היא{" "}
            <span className="font-display font-black">
              {correctAnswer ?? ""}
            </span>
            .
          </span>
        </>
      )}
    </div>
  </div>
);

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
    sessionCompleted,
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

  const {
    totalDisplay,
    questionDisplay,
    questionUrgent,
    resetQuestion,
    clearStorage,
  } = useElapsedTimer(id ?? "", currentIndex ?? 0, sessionCompleted);

  const exitGuard = useSessionExitGuard({
    sessionId: id,
    enabled: status === "ready" && !sessionCompleted,
    answeredCount,
    onDiscard: clearStorage,
  });

  if (status === "loading") {
    return <AppLoader variant="page" label="טוען נתונים..." />;
  }

  if (status === "error" || !current) {
    return (
      <PageShell className="pb-32">
        <ErrorState
          message="החיבור נכשל. נסה שוב"
          action={<Button onClick={retry}>נסה שוב</Button>}
        />
      </PageShell>
    );
  }

  const handleSubmit = () => {
    tap();
    resetQuestion();
    submit();
  };

  const handleNext = () => {
    tap();
    next();
  };

  const handleComplete = () => {
    tap();
    clearStorage();
    complete();
  };
  const showFixedFooter =
    answerSubmitted || displaySelected !== null || current.answer !== null;

  return (
    <PageShell className="pb-32">
      <AppHeader
        back={{ onClick: () => navigate("/") }}
        eyebrow={modeLabel}
        progress={{ current: currentIndex + 1, total, answered: answeredCount }}
        actions={
          <div className="flex items-center gap-2">
            <TimerDisplay
              kind="elapsed"
              totalDisplay={totalDisplay}
              questionDisplay={questionDisplay}
              questionUrgent={questionUrgent}
            />
            <BookmarkButton
              isBookmarked={isBookmarked}
              busy={bookmarkBusy}
              onToggle={toggleBookmark}
            />
          </div>
        }
      />

      <main className="mt-4 space-y-5">
        <SessionQuestionCard question={current} isBookmarked={isBookmarked} />

        {answerSubmitted && practiceAnswer && (
          <AnswerFeedback
            isCorrect={practiceAnswer.is_correct}
            correctAnswer={correctAnswer}
            scoringStatus={practiceAnswer.scoring_status}
          />
        )}

        <SessionAnswerOptions
          question={current}
          mode="practice"
          disabled={answerSubmitted || submitting}
          displaySelected={displaySelected}
          answerSubmitted={answerSubmitted}
          currentAnswer={current.answer}
          practiceAnswer={practiceAnswer}
          correctAnswer={correctAnswer}
          onSelect={selectAnswer}
        />

        {answerSubmitted && current.reference && (
          <ReferenceBox reference={current.reference} />
        )}

        <QuestionNavigation
          currentIndex={currentIndex}
          isLast={isLast}
          canGoNext={answerSubmitted}
          onPrev={prev}
          onNext={next}
        />
      </main>

      {showFixedFooter && (
        <FixedFooter>
          {!answerSubmitted && (
            <>
              <Button
                fullWidth
                disabled={submitDisabled}
                onClick={handleSubmit}
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

              {completeReason && (
                <p className="text-center text-xs text-secondary">
                  {completeReason}
                </p>
              )}
            </>
          )}
        </FixedFooter>
      )}

      <ConfirmSheet
        open={exitGuard.promptOpen}
        title="לצאת מהתרגול?"
        description="ההתקדמות נשמרה. אפשר להמשיך אחר כך, או לצאת ולמחוק את ההתקדמות בתרגול הזה."
        confirmLabel="המשך אחר כך"
        cancelLabel={exitGuard.discarding ? "מוחק..." : "צא ומחק"}
        tertiaryLabel="הישאר בתרגול"
        onConfirm={exitGuard.saveAndExit}
        onCancel={() => void exitGuard.discardAndExit()}
        onTertiary={exitGuard.stay}
      />
    </PageShell>
  );
};

export default SessionPage;
