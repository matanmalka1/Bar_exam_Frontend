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
import { getPracticeSession } from "../api";
import type {
  AnswerOption,
  SessionDetail,
  SessionQuestion,
} from "../types";

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
  q.answer !== null && q.answer.is_correct === false;

const StatItem = ({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) => (
  <div className="rounded-2xl border border-default bg-surface px-3 py-3">
    <p className="text-xs text-secondary">{label}</p>
    <p className="mt-1 tabular-nums font-semibold text-[var(--accent-ink)]">
      {value}
    </p>
  </div>
);

const ScoreCard = ({
  session,
  total,
  answered,
  correct,
  mistakesCount,
  scorePercent,
}: {
  session: SessionDetail;
  total: number;
  answered: number;
  correct: number;
  mistakesCount: number;
  scorePercent: string;
}) => (
  <Card className="surface-muted">
    <div className="text-center">
      <p className="text-sm font-medium text-[var(--accent)]">הציון שלך</p>

      <p className="font-display mt-2 tabular-nums text-7xl font-black leading-none text-[var(--accent-ink)]">
        {scorePercent}%
      </p>

      <p className="mt-3 tabular-nums text-sm text-secondary">
        {correct} נכונות מתוך {total}
      </p>

      <div className="mt-5 grid grid-cols-3 gap-2 text-sm">
        <StatItem label="נענו" value={`${answered}/${total}`} />
        <StatItem label="נכונות" value={correct} />
        <StatItem label="טעויות" value={mistakesCount} />
      </div>

      {session.completed_at && (
        <p className="mt-4 text-xs text-secondary">
          הושלם: {formatDate(session.completed_at)}
        </p>
      )}
    </div>
  </Card>
);

const MistakeCard = ({ question }: { question: SessionQuestion }) => {
  const [open, setOpen] = useState(false);
  const selected = question.answer?.selected_answer ?? null;
  const correctAns = question.correct_answer ?? null;

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between gap-3 border-b border-default pb-3">
        <p className="text-xs font-semibold text-[var(--accent)]">
          שאלה {question.number}
        </p>

        <p className="rounded-full border border-default bg-[var(--surface-muted)] px-3 py-1 text-xs text-secondary">
          תשובה נכונה: {correctAns}
        </p>
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

      <button
        type="button"
        className="inline-flex items-center gap-1 rounded-xl px-1 py-1 text-xs font-medium text-secondary transition hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ink)]/30"
        onClick={() => setOpen((v) => !v)}
      >
        <ChevronLeft
          className={cn("h-4 w-4 transition-transform", open && "-rotate-90")}
          strokeWidth={2.4}
        />
        {open ? "הסתר תשובה" : "הצג תשובה"}
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
                isCorrect={correctAns === opt}
                isWrong={selected === opt && correctAns !== opt}
                showCorrectBadge
                showSelectedBadge
              />
            ))}
          </div>

          {question.reference && <ReferenceBox reference={question.reference} />}
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
  }, [id, reloadKey]);

  const mistakes = useMemo<SessionQuestion[]>(
    () => session?.questions.filter(isMistake) ?? [],
    [session],
  );

  const retry = () => {
    setStatus("loading");
    setReloadKey((key) => key + 1);
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

  const scoreNumber = Number(
    session.score_percent ?? (total > 0 ? (correct / total) * 100 : 0),
  );

  const scorePercent = Number.isFinite(scoreNumber)
    ? Math.round(scoreNumber).toString()
    : "0";

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
          scorePercent={scorePercent}
        />

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
                <MistakeCard key={q.stable_id} question={q} />
              ))}
            </div>
          )}
        </section>
      </main>

      <FixedFooter>
        <div className="flex gap-2">
          <Button variant="secondary" fullWidth onClick={() => navigate("/")}>
            חזרה לבית
          </Button>

          <Button fullWidth onClick={() => navigate("/practice/new")}>
            תרגול חדש
          </Button>
        </div>
      </FixedFooter>
    </PageShell>
  );
};

export default ResultsPage;
