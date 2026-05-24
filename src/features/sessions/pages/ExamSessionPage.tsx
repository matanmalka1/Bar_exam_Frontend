import { useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppHeader from "../../../components/AppHeader";
import BookmarkButton from "../../../components/BookmarkButton";
import Button from "../../../components/Button";
import ErrorState from "../../../components/ErrorState";
import FixedFooter from "../../../components/FixedFooter";
import PageShell from "../../../components/PageShell";
import AppLoader from "../../../components/loader";
import QuestionNavigation from "../components/QuestionNavigation";
import SessionAnswerOptions from "../components/SessionAnswerOptions";
import SessionQuestionCard from "../components/SessionQuestionCard";
import TimerDisplay from "../components/TimerDisplay";
import TimeUpModal from "../components/TimeUpModal";
import { useExamSession } from "../hooks/useExamSession";
import { useCountdownTimer, useElapsedTimer } from "../hooks/useTimer";
import { tap } from "../../../lib/haptics";

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

  const { display, urgent, expired, clearStorage } = useCountdownTimer(
    id ?? "",
    sessionCompleted,
  );
  const {
    questionDisplay,
    questionUrgent,
    clearStorage: clearElapsedStorage,
  } = useElapsedTimer(id ?? "", currentIndex ?? 0, sessionCompleted);

  useEffect(() => {
    if (expired && status === "ready") {
      clearStorage();
      clearElapsedStorage();
      complete();
    }
  }, [expired, status, complete, clearStorage, clearElapsedStorage]);

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

  const handlePrimaryAction = () => {
    tap();
    submitOrNext();
  };

  const handleCompleteAction = () => {
    tap();
    clearStorage();
    clearElapsedStorage();
    complete();
  };

  return (
    <PageShell className="pb-32">
      {expired && <TimeUpModal onConfirm={complete} />}

      <AppHeader
        back={{ onClick: () => navigate("/") }}
        eyebrow={EXAM_MODE_LABEL}
        progress={{ current: currentIndex + 1, total, answered: answeredCount }}
        actions={
          <div className="flex items-center gap-2">
            <TimerDisplay
              kind="countdown"
              display={display}
              urgent={urgent}
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

        <SessionAnswerOptions
          question={current}
          mode="exam"
          disabled={submitting || answerSubmitted}
          displaySelected={displaySelected}
          answerSubmitted={answerSubmitted}
          onSelect={selectAnswer}
        />

        <QuestionNavigation
          currentIndex={currentIndex}
          isLast={isLast}
          canGoNext={answerSubmitted}
          onPrev={prev}
          onNext={next}
        />
      </main>

      <FixedFooter>
        {!showComplete ? (
          <>
            <Button
              fullWidth
              disabled={primaryDisabled}
              onClick={handlePrimaryAction}
            >
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
        ) : (
          <>
            <Button
              fullWidth
              disabled={!allAnswered || completing}
              onClick={handleCompleteAction}
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
    </PageShell>
  );
};

export default ExamSessionPage;
