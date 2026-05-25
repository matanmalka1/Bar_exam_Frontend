import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Flag, Grid3x3 } from "lucide-react";
import AppHeader from "../../../components/AppHeader";
import BookmarkButton from "../../../components/BookmarkButton";
import Button from "../../../components/Button";
import ConfirmSheet from "../../../components/ConfirmSheet";
import ErrorState from "../../../components/ErrorState";
import FixedFooter from "../../../components/FixedFooter";
import PageShell from "../../../components/PageShell";
import AppLoader from "../../../components/loader";
import QuestionGridSheet from "../components/QuestionGridSheet";
import QuestionNavigation from "../components/QuestionNavigation";
import SessionAnswerOptions from "../components/SessionAnswerOptions";
import SessionQuestionCard from "../components/SessionQuestionCard";
import TimerDisplay from "../components/TimerDisplay";
import TimeUpModal from "../components/TimeUpModal";
import { useExamSession } from "../hooks/useExamSession";
import { useSessionExitGuard } from "../hooks/useSessionExitGuard";
import { useCountdownTimer, useElapsedTimer } from "../hooks/useTimer";
import type { SessionQuestion } from "../types";
import { tap } from "../../../lib/haptics";

const EXAM_MODE_LABEL = "מצב בחינה · ללא משוב";
type ExamPart = "B" | "C";

const PART_META: Record<
  ExamPart,
  { title: string; shortTitle: string; startLabel: string }
> = {
  B: {
    title: "חלק ב׳ · דין דיוני",
    shortTitle: "חלק ב׳",
    startLabel: "נכנסת לחלק ב׳",
  },
  C: {
    title: "חלק ג׳ · דין מהותי",
    shortTitle: "חלק ג׳",
    startLabel: "מתחיל חלק ג׳",
  },
};

const questionPart = (question: SessionQuestion): ExamPart | null => {
  const match = question.stable_id.match(/^\d{4}-(0[1-9]|1[0-2])_([BC])_/);
  return match ? (match[2] as ExamPart) : null;
};

const getPartProgress = (
  questions: SessionQuestion[],
  currentIndex: number,
) => {
  const current = questions[currentIndex];
  if (!current) return null;

  const part = questionPart(current);
  if (!part) return null;

  const firstIndex = questions.findIndex(
    (question) => questionPart(question) === part,
  );
  const total = questions.filter(
    (question) => questionPart(question) === part,
  ).length;
  const currentInPart = questions
    .slice(0, currentIndex + 1)
    .filter((question) => questionPart(question) === part).length;

  return {
    part,
    firstIndex,
    currentInPart,
    total,
    progressPct: total > 0 ? (currentInPart / total) * 100 : 0,
  };
};

const ExamSessionPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [gridOpen, setGridOpen] = useState(false);

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
    isSimulation,
    questions,
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
    flaggedIndices,
    toggleFlag,
    goTo,
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
      void complete(true);
    }
  }, [expired, status, complete, clearStorage, clearElapsedStorage]);

  const exitGuard = useSessionExitGuard({
    sessionId: id,
    enabled: status === "ready" && !sessionCompleted,
    answeredCount,
    onDiscard: () => {
      clearStorage();
      clearElapsedStorage();
    },
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
  const showFixedFooter =
    showComplete || answerSubmitted || displaySelected !== null;
  const partProgress = getPartProgress(questions, currentIndex);
  const partMeta = partProgress ? PART_META[partProgress.part] : null;
  const partLabel =
    partProgress && partMeta && currentIndex === partProgress.firstIndex
      ? partMeta.startLabel
      : partMeta?.title;

  return (
    <PageShell className="pb-32">
      {expired && <TimeUpModal onConfirm={() => void complete(true)} />}

      <AppHeader
        back={{ onClick: () => navigate("/") }}
        eyebrow={EXAM_MODE_LABEL}
        progress={{ current: currentIndex + 1, total, answered: answeredCount }}
        actions={
          <div className="flex items-center gap-1">
            <TimerDisplay
              kind="countdown"
              display={display}
              urgent={urgent}
              questionDisplay={questionDisplay}
              questionUrgent={questionUrgent}
            />
            <button
              type="button"
              onClick={() => {
                tap();
                toggleFlag(currentIndex);
              }}
              className="focus-ring flex h-9 w-9 items-center justify-center rounded-xl transition"
              aria-label="סמן שאלה לחזרה"
              aria-pressed={flaggedIndices.has(currentIndex)}
            >
              <Flag
                className={
                  flaggedIndices.has(currentIndex)
                    ? "h-4 w-4 fill-amber-500 text-amber-500"
                    : "h-4 w-4 text-secondary"
                }
              />
            </button>
            <button
              type="button"
              onClick={() => setGridOpen(true)}
              className="focus-ring flex h-9 w-9 items-center justify-center rounded-xl transition"
              aria-label="רשימת שאלות"
            >
              <Grid3x3 className="h-4 w-4 text-secondary" />
            </button>
            <BookmarkButton
              isBookmarked={isBookmarked}
              busy={bookmarkBusy}
              onToggle={toggleBookmark}
            />
          </div>
        }
      />

      {partProgress && partMeta && (
        <section
          className="rounded-2xl border border-default bg-[var(--surface-muted)] px-4 py-3"
          aria-label="התקדמות לפי חלק"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-display text-base font-bold text-[var(--accent-ink)]">
                {partLabel}
              </p>
              <p className="mt-1 text-xs text-secondary">
                {`שאלה ${partProgress.currentInPart} מתוך ${partProgress.total} ב${partMeta.shortTitle}`}
              </p>
            </div>
            <span className="font-display rounded-full border border-default bg-surface px-3 py-1 text-xs font-bold text-secondary">
              {partMeta.shortTitle}
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--border-subtle)]">
            <div
              className="h-full rounded-full bg-[var(--accent-ink)] transition-all duration-500 ease-out"
              style={{ width: `${partProgress.progressPct}%` }}
            />
          </div>
        </section>
      )}

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
          onPrev={prev}
          onNext={next}
        />
      </main>

      {showFixedFooter && (
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
      )}

      {gridOpen && (
        <QuestionGridSheet
          questions={questions}
          currentIndex={currentIndex}
          flaggedIndices={flaggedIndices}
          isSimulation={isSimulation}
          onNavigate={goTo}
          onClose={() => setGridOpen(false)}
        />
      )}

      <ConfirmSheet
        open={exitGuard.promptOpen}
        title="לשמור את הבחינה להמשך?"
        description="ענית כבר על שאלה אחת לפחות. אפשר לשמור את הבחינה ולחזור אליה אחר כך, או לצאת בלי לשמור."
        confirmLabel="שמור וצא"
        cancelLabel={exitGuard.discarding ? "יוצא..." : "אל תשמור"}
        tertiaryLabel="הישאר בבחינה"
        onConfirm={exitGuard.saveAndExit}
        onCancel={() => void exitGuard.discardAndExit()}
        onTertiary={exitGuard.stay}
      />
    </PageShell>
  );
};

export default ExamSessionPage;
