import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../components/Button";
import Card from "../components/Card";
import ErrorState from "../components/ErrorState";
import FixedFooter from "../components/FixedFooter";
import ReviewOption from "../components/ReviewOption";
import AppLoader from "../components/loader";
import { getPracticeSession } from "../features/sessions/api";
import type {
  AnswerOption,
  SessionDetail,
  SessionQuestion,
} from "../features/sessions/types";

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

const ResultsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [status, setStatus] = useState<Status>("loading");
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
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  const mistakes = useMemo<SessionQuestion[]>(
    () => session?.questions.filter(isMistake) ?? [],
    [session],
  );

  if (status === "loading") {
    return <AppLoader variant="page" label="טוען נתונים..." />;
  }

  if (status === "error" || !session) {
    return (
      <div className="mx-auto w-full max-w-[720px] p-4">
        <ErrorState
          message="לא ניתן לטעון את התוצאות"
          action={
            <Button
              onClick={() => {
                setStatus("loading");
                setReloadKey((k) => k + 1);
              }}
            >
              נסה שוב
            </Button>
          }
        />
      </div>
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
    <div className="mx-auto w-full max-w-[720px] space-y-4 p-4 pb-24">
      <header className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/")}>
          חזרה
        </Button>
        <h1 className="font-display text-2xl font-bold text-[var(--accent-ink)]">
          תוצאות
        </h1>
        <span className="w-16" />
      </header>

      <Card className="surface-muted">
        <div className="space-y-2 text-center">
          <p className="text-sm font-medium text-[var(--accent)]">הציון שלך</p>
          <p className="font-display text-6xl font-black text-[var(--accent-ink)]">
            {scorePercent}%
          </p>
          <p className="text-sm text-secondary">
            {correct} נכונות מתוך {total}
          </p>
          <div className="grid grid-cols-3 gap-2 pt-3 text-sm">
            <div>
              <p className="text-secondary">נענו</p>
              <p className="font-semibold text-[var(--accent-ink)]">
                {answered}/{total}
              </p>
            </div>
            <div>
              <p className="text-secondary">נכונות</p>
              <p className="font-semibold text-primary">{correct}</p>
            </div>
            <div>
              <p className="text-secondary">טעויות</p>
              <p className="font-semibold text-primary">{mistakes.length}</p>
            </div>
          </div>
          {session.completed_at && (
            <p className="pt-2 text-xs text-secondary">
              הושלם: {formatDate(session.completed_at)}
            </p>
          )}
        </div>
      </Card>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-[var(--accent-ink)]">
          טעויות ({mistakes.length})
        </h2>
        {mistakes.length === 0 ? (
          <Card>
            <p className="text-sm text-secondary">אין טעויות.</p>
          </Card>
        ) : (
          mistakes.map((q) => {
            const selected = q.answer?.selected_answer ?? null;
            const correctAns = q.correct_answer ?? null;
            return (
              <Card key={q.stable_id} className="space-y-3">
                <p className="text-xs font-medium text-[var(--accent)]">
                  שאלה {q.number}
                </p>
                <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--ink)]">
                  {q.body}
                </p>
                <div className="grid gap-2">
                  {OPTIONS.map((opt) => (
                    <ReviewOption
                      key={opt}
                      label={opt}
                      text={q.options[opt]}
                      isCorrect={correctAns === opt}
                      isSelectedWrong={selected === opt && correctAns !== opt}
                      showCorrectHint
                      showSelectedHint
                    />
                  ))}
                </div>
                {q.reference && (
                  <div className="rounded-xl border border-default surface-muted p-3">
                    <p className="text-xs font-semibold text-[var(--accent)]">
                      הפניה
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-primary">
                      {q.reference}
                    </p>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </section>

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
    </div>
  );
};

export default ResultsPage;
