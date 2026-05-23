import { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Check, X } from "lucide-react";
import AppHeader from "../../../components/AppHeader";
import BookmarkButton from "../../../components/BookmarkButton";
import Button from "../../../components/Button";
import ErrorState from "../../../components/ErrorState";
import FixedFooter from "../../../components/FixedFooter";
import AppLoader from "../../../components/loader";
import QuestionNavigation from "../components/QuestionNavigation";
import SessionAnswerOptions from "../components/SessionAnswerOptions";
import SessionQuestionCard from "../components/SessionQuestionCard";
import { usePracticeSession } from "../hooks/usePracticeSession";
import { cn } from "../../../lib/cn";
import { tap } from "../../../lib/haptics";

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

      <SessionQuestionCard question={current} isBookmarked={isBookmarked} />

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
        <section className="mt-6 border-t border-default pt-4">
          <p className="font-display text-[10px] uppercase tracking-[0.22em] text-secondary">
            הפניה
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-primary">
            {current.reference}
          </p>
        </section>
      )}

      <QuestionNavigation
        currentIndex={currentIndex}
        isLast={isLast}
        canGoNext={answerSubmitted}
        onPrev={prev}
        onNext={next}
      />

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
