import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import AppHeader from "../../../components/AppHeader";
import Button from "../../../components/Button";
import Card from "../../../components/Card";
import ErrorState from "../../../components/ErrorState";
import FixedFooter from "../../../components/FixedFooter";
import OptionCard from "../../../components/OptionCard";
import PageShell from "../../../components/PageShell";
import ReferenceBox from "../../../components/ReferenceBox";
import AppLoader from "../../../components/loader";
import { cn } from "../../../lib/cn";
import { notifyError } from "../../../lib/toast";
import { getPracticeSession, createMistakesSession } from "../api";
import type { AnswerOption, SessionDetail, SessionQuestion } from "../types";
import { isExamLike } from "../types";

type Status = "loading" | "ready" | "error";

const OPTIONS: AnswerOption[] = ["א", "ב", "ג", "ד"];

const formatDate = (iso: string | null): string => {
  if (!iso) return "";

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  return date.toLocaleString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const isMistake = (q: SessionQuestion): boolean =>
  q.status !== "invalidated" &&
  q.answer !== null &&
  q.answer.is_correct === false;

const isInvalidatedCredit = (q: SessionQuestion): boolean =>
  q.status === "invalidated" && q.answer !== null;

const StatItem = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="rounded-2xl border border-default bg-surface px-3 py-3">
    <p className="text-xs text-secondary">{label}</p>
    <p className="mt-1 tabular-nums font-semibold text-[var(--accent-ink)]">
      {value}
    </p>
  </div>
);

const PASSING_SCORE = 60;

const ScoreCard = ({
  session,
  total,
  answered,
  correct,
  mistakesCount,
  invalidatedCredits,
  score,
  maxScore,
}: {
  session: SessionDetail;
  total: number;
  answered: number;
  correct: number;
  mistakesCount: number;
  invalidatedCredits: number;
  score: number;
  maxScore: number;
}) => {
  const examMode = isExamLike(session.mode);
  const passed = examMode && score >= PASSING_SCORE;

  return (
    <Card className="surface-muted">
      <div className="text-center">
        <p className="text-sm font-medium text-[var(--accent)]">הציון שלך</p>

        <p className="font-display mt-2 tabular-nums text-7xl font-black leading-none text-[var(--accent-ink)]">
          {score} <span className="text-3xl">/ {maxScore}</span>
        </p>

        {examMode && (
          <p
            className="mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold"
            style={
              passed
                ? {
                    background: "var(--color-pass-bg)",
                    color: "var(--color-pass-text)",
                  }
                : {
                    background: "var(--color-fail-bg)",
                    color: "var(--color-fail-text)",
                  }
            }
          >
            {passed ? "עבר ✓" : "לא עבר ✗"} (מעבר: {PASSING_SCORE})
          </p>
        )}

        <p className="mt-3 tabular-nums text-sm text-secondary">
          {correct} נכונות מתוך {total}
        </p>

        <div className="mt-5 grid grid-cols-3 gap-2 text-sm">
          <StatItem label="נענו" value={`${answered}/${total}`} />
          <StatItem label="נכונות" value={correct} />
          <StatItem label="טעויות" value={mistakesCount} />
        </div>

        {invalidatedCredits > 0 && (
          <p className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900">
            {invalidatedCredits} נקודות ניתנו על שאלות שנפסלו
          </p>
        )}

        {session.completed_at && (
          <p className="mt-4 text-xs text-secondary">
            הושלם: {formatDate(session.completed_at)}
          </p>
        )}
      </div>
    </Card>
  );
};

const PART_LABEL: Record<string, string> = {
  B: "חלק ב׳ · דין דיוני",
  C: "חלק ג׳ · דין מהותי",
};

const PartBreakdownCard = ({
  breakdown,
}: {
  breakdown: NonNullable<SessionDetail["part_breakdown"]>;
}) => {
  const parts = (["B", "C"] as const).filter((p) => breakdown[p]);

  if (parts.length === 0) return null;

  return (
    <Card className="space-y-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
        פירוט לפי חלק
      </p>

      {parts.map((part) => {
        const bd = breakdown[part];
        if (!bd) return null;

        const score = Math.round(Number(bd.score));
        const pct =
          bd.max_score > 0
            ? Math.round((bd.correct / bd.max_score) * 100)
            : 0;

        return (
          <div key={part} className="space-y-2">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-semibold text-[var(--accent-ink)]">
                {PART_LABEL[part]}
              </span>
              <span className="font-display tabular-nums text-lg font-black leading-none text-[var(--accent-ink)]">
                {score} / {bd.max_score}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]">
              <div
                className="h-full rounded-full bg-[var(--accent-ink)] transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex gap-3 text-[11px] tabular-nums text-secondary">
              <span>{bd.answered} נענו</span>
              <span>·</span>
              <span>{bd.correct} נכונות</span>
              <span>·</span>
              <span>{Math.max(0, bd.answered - bd.correct)} שגויות</span>
            </div>
          </div>
        );
      })}
    </Card>
  );
};

const QuestionResultCard = ({
  question,
  variant,
}: {
  question: SessionQuestion;
  variant: "mistake" | "invalidated";
}) => {
  const [open, setOpen] = useState(false);
  const selected = question.answer?.selected_answer ?? null;
  const correctAns = question.correct_answer ?? null;
  const isInvalidated = variant === "invalidated";

  return (
    <Card
      className={cn(
        "space-y-4",
        isInvalidated && "border-amber-200 bg-amber-50/40",
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between gap-3 border-b pb-3",
          isInvalidated ? "border-amber-200" : "border-default",
        )}
      >
        <p
          className={cn(
            "text-xs font-semibold",
            isInvalidated ? "text-amber-900" : "text-[var(--accent)]",
          )}
        >
          שאלה {question.number}
        </p>

        {isInvalidated ? (
          <p className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900">
            שאלה שנפסלה
          </p>
        ) : (
          <p className="rounded-full border border-default bg-[var(--surface-muted)] px-3 py-1 text-xs text-secondary">
            תשובה נכונה: {correctAns}
          </p>
        )}
      </div>

      <button
        type="button"
        className="w-full text-right"
        onClick={() => setOpen((v) => !v)}
      >
        <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--ink)]">
          {question.body}
        </p>
      </button>

      {isInvalidated && (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900">
          {selected ? `סומנה תשובה ${selected}. ` : ""}
          השאלה נפסלה, ולכן ניתנה עליה נקודה מלאה.
        </p>
      )}

      <button
        type="button"
        className="inline-flex items-center gap-1 rounded-xl px-1 py-1 text-xs font-medium text-secondary transition hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ink)]/30"
        onClick={() => setOpen((v) => !v)}
      >
        <ChevronLeft
          className={cn("h-4 w-4 transition-transform", open && "-rotate-90")}
          strokeWidth={2.4}
        />
        {open ? "הסתר תשובות" : "הצג תשובות"}
      </button>

      {open && (
        <>
          <div className="grid gap-2">
            {OPTIONS.map((opt) => (
              <OptionCard
                key={opt}
                mode="review"
                label={opt}
                text={question.options[opt]}
                {...(isInvalidated
                  ? { selected: selected === opt, showSelectedBadge: true }
                  : {
                      isCorrect: correctAns === opt,
                      isWrong: selected === opt && correctAns !== opt,
                      showCorrectBadge: true,
                      showSelectedBadge: true,
                    })}
              />
            ))}
          </div>

          {!isInvalidated && question.reference && (
            <ReferenceBox reference={question.reference} />
          )}
        </>
      )}
    </Card>
  );
};

const ResultsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [status, setStatus] = useState<Status>(id ? "loading" : "error");
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    getPracticeSession(id)
      .then((data) => {
        if (cancelled) return;

        if (data.status !== "completed") {
          const route = isExamLike(data.mode)
            ? `/session/${id}/exam`
            : `/session/${id}`;
          navigate(route, { replace: true });
          return;
        }

        setSession(data);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) {
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id, reloadKey, navigate]);

  const mistakes = useMemo<SessionQuestion[]>(
    () => session?.questions.filter(isMistake) ?? [],
    [session],
  );
  const invalidatedQuestions = useMemo<SessionQuestion[]>(
    () => session?.questions.filter(isInvalidatedCredit) ?? [],
    [session],
  );

  const [startingMistakes, setStartingMistakes] = useState(false);

  const retry = () => {
    setStatus("loading");
    setReloadKey((key) => key + 1);
  };

  const handlePracticeMistakes = async () => {
    setStartingMistakes(true);
    try {
      const s = await createMistakesSession();
      navigate(`/session/${s.id}`);
    } catch {
      notifyError("לא ניתן לפתוח תרגול טעויות כרגע");
    } finally {
      setStartingMistakes(false);
    }
  };

  if (status === "loading") {
    return <AppLoader variant="page" label="טוען נתונים..." />;
  }

  if (status === "error" || !session) {
    return (
      <PageShell className="pb-28">
        <ErrorState
          message="לא ניתן לטעון את התוצאות"
          action={<Button onClick={retry}>נסה שוב</Button>}
        />
      </PageShell>
    );
  }

  const total = session.total_questions;
  const answered = session.answered_count;
  const correct = session.correct_count ?? 0;
  const invalidatedCredits =
    session.questions.filter(isInvalidatedCredit).length;

  const scoreRaw = Number(session.score ?? correct);
  const score = Number.isFinite(scoreRaw) ? Math.round(scoreRaw) : 0;
  const maxScore = session.max_score ?? total;

  return (
    <PageShell className="pb-28">
      <AppHeader back={{ onClick: () => navigate("/") }} title="תוצאות" />

      <main className="mt-4 space-y-5">
        <ScoreCard
          session={session}
          total={total}
          answered={answered}
          correct={correct}
          mistakesCount={mistakes.length}
          invalidatedCredits={invalidatedCredits}
          score={score}
          maxScore={maxScore}
        />

        {session.part_breakdown && (
          <PartBreakdownCard breakdown={session.part_breakdown} />
        )}

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-bold text-[var(--accent-ink)]">
              טעויות
            </h2>

            <span className="rounded-full border border-default bg-[var(--surface-muted)] px-3 py-1 text-xs text-secondary">
              {mistakes.length} שאלות
            </span>
          </div>

          {mistakes.length === 0 ? (
            <Card className="surface-muted">
              <p className="text-center text-sm text-secondary">
                אין טעויות. עבודה טובה.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {mistakes.map((q) => (
                <QuestionResultCard
                  key={q.stable_id}
                  question={q}
                  variant="mistake"
                />
              ))}
            </div>
          )}
        </section>

        {invalidatedQuestions.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-lg font-bold text-[var(--accent-ink)]">
                שאלות שנפסלו
              </h2>

              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900">
                {invalidatedQuestions.length} שאלות
              </span>
            </div>

            <div className="space-y-3">
              {invalidatedQuestions.map((q) => (
                <QuestionResultCard
                  key={q.stable_id}
                  question={q}
                  variant="invalidated"
                />
              ))}
            </div>
          </section>
        )}
      </main>

      <FixedFooter>
        {mistakes.length > 0 && (
          <Button
            fullWidth
            disabled={startingMistakes}
            onClick={() => void handlePracticeMistakes()}
          >
            {startingMistakes ? (
              <AppLoader variant="button" label="פותח..." />
            ) : (
              `תרגל ${mistakes.length} טעויות`
            )}
          </Button>
        )}
        <div className="flex gap-2">
          <Button variant="secondary" fullWidth onClick={() => navigate("/")}>
            חזרה לבית
          </Button>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => navigate("/practice/new")}
          >
            תרגול חדש
          </Button>
        </div>
      </FixedFooter>
    </PageShell>
  );
};

export default ResultsPage;
