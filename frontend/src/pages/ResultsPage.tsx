import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../components/Button";
import Card from "../components/Card";
import ErrorState from "../components/ErrorState";
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
    return (
      <div className="mx-auto w-full max-w-[720px] p-4">
        <p className="text-stone-600">טוען...</p>
      </div>
    );
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
    <div className="mx-auto w-full max-w-[720px] p-4 pb-32 space-y-4">
      <header className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/")}>
          חזרה
        </Button>
        <h1 className="font-display text-2xl font-bold text-[var(--accent-ink)]">
          תוצאות
        </h1>
        <span className="w-16" />
      </header>

      <Card className="bg-[#fffaf1]">
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-[var(--accent)]">הציון שלך</p>
          <p className="font-display text-6xl font-black text-[var(--accent-ink)]">
            {scorePercent}%
          </p>
          <p className="text-sm text-stone-600">
            {correct} נכונות מתוך {total}
          </p>
          <div className="grid grid-cols-3 gap-2 pt-3 text-sm">
            <div>
              <p className="text-stone-500">נענו</p>
              <p className="font-semibold text-[var(--accent-ink)]">
                {answered}/{total}
              </p>
            </div>
            <div>
              <p className="text-stone-500">נכונות</p>
              <p className="font-semibold text-green-700">{correct}</p>
            </div>
            <div>
              <p className="text-stone-500">טעויות</p>
              <p className="font-semibold text-red-700">{mistakes.length}</p>
            </div>
          </div>
          {session.completed_at && (
            <p className="pt-2 text-xs text-stone-500">
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
            <p className="text-sm text-stone-600">אין טעויות.</p>
          </Card>
        ) : (
          mistakes.map((q) => {
            const selected = q.answer?.selected_answer;
            const correctAns = q.correct_answer ?? null;
            return (
              <Card key={q.stable_id} className="space-y-3">
                <p className="text-xs font-medium text-[var(--accent)]">
                  שאלה {q.number}
                </p>
                <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--ink)]">
                  {q.body}
                </p>
                <div className="grid gap-1.5">
                  {OPTIONS.map((opt) => {
                    const isSel = selected === opt;
                    const isCor = correctAns === opt;
                    return (
                      <div
                        key={opt}
                        className={
                          "rounded-lg border p-2 text-sm " +
                          (isCor
                            ? "border-green-500 bg-green-50 text-green-900"
                            : isSel
                              ? "border-red-500 bg-red-50 text-red-900"
                              : "border-[#dccfbb] bg-white text-stone-800")
                        }
                      >
                        <span className="font-semibold">{opt}.</span>{" "}
                        {q.options[opt]}
                        {isCor && (
                          <span className="mr-2 text-xs font-medium text-green-700">
                            (תשובה נכונה)
                          </span>
                        )}
                        {isSel && !isCor && (
                          <span className="mr-2 text-xs font-medium text-red-700">
                            (התשובה שלך)
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                {q.reference && (
                  <div className="rounded-xl border border-[var(--accent-soft)] bg-[#fff8fd] p-3">
                    <p className="text-xs font-semibold text-[var(--accent)]">
                      הפניה
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-stone-800">
                      {q.reference}
                    </p>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </section>

      <div className="fixed inset-x-0 bottom-0 border-t border-[#e2d5c2] bg-white/90 p-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] shadow-[0_-10px_30px_rgba(79,31,64,0.08)] backdrop-blur">
        <div className="mx-auto flex w-full max-w-[720px] gap-2">
          <Button variant="secondary" fullWidth onClick={() => navigate("/")}>
            חזרה לבית
          </Button>
          <Button fullWidth onClick={() => navigate("/practice/new")}>
            תרגול חדש
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
