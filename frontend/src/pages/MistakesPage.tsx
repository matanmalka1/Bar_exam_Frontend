import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Card from "../components/Card";
import ErrorState from "../components/ErrorState";
import FixedFooter from "../components/FixedFooter";
import PageLoading from "../components/PageLoading";
import ReviewOption from "../components/ReviewOption";
import { getMistakes } from "../features/mistakes/api";
import type { MistakeItem } from "../features/mistakes/types";
import { createMistakesSession } from "../features/sessions/api";
import type { AnswerOption } from "../features/sessions/types";
import { HTTP_UNPROCESSABLE, isApiStatusError } from "../lib/api";

type Status = "loading" | "ready" | "error";

const OPTIONS: AnswerOption[] = ["א", "ב", "ג", "ד"];

const PART_LABEL: Record<string, string> = {
  B: "דין דיוני",
  C: "דין מהותי",
};

const formatExamDate = (raw: string): string => {
  const m = raw.match(/^(\d{4})-(\d{2})/);
  if (!m) return raw;
  return `${m[2]}/${m[1]}`;
};

const MistakesPage = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("loading");
  const [items, setItems] = useState<MistakeItem[]>([]);
  const [reloadKey, setReloadKey] = useState(0);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getMistakes()
      .then((data) => {
        if (cancelled) return;
        setItems(data);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const retry = () => {
    setStatus("loading");
    setReloadKey((k) => k + 1);
  };

  const handlePracticeMistakes = async () => {
    if (starting || items.length === 0) return;
    setStartError(null);
    setStarting(true);
    try {
      const s = await createMistakesSession();
      navigate(`/session/${s.id}`);
    } catch (err) {
      setStartError(
        isApiStatusError(err, HTTP_UNPROCESSABLE)
          ? "אין טעויות זמינות לתרגול"
          : "לא ניתן להתחיל תרגול טעויות כרגע",
      );
    } finally {
      setStarting(false);
    }
  };

  if (status === "loading") return <PageLoading />;

  if (status === "error") {
    return (
      <div className="mx-auto w-full max-w-[720px] p-4">
        <ErrorState
          message="לא ניתן לטעון את הטעויות"
          action={<Button onClick={retry}>נסה שוב</Button>}
        />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto w-full max-w-[720px] space-y-4 p-4 pb-28">
        <header>
          <h1 className="font-display text-3xl font-bold text-[var(--accent-ink)]">
            טעויות
          </h1>
          <p className="text-sm text-stone-600">חזרה על שאלות שטעית בהן</p>
        </header>
        <Card className="space-y-3 text-center">
          <h2 className="text-lg font-semibold text-[var(--accent-ink)]">
            אין טעויות עדיין
          </h2>
          <p className="text-sm text-stone-600">
            טעויות מתרגולים יופיעו כאן כדי שתוכל לחזור עליהן.
          </p>
          <Button onClick={() => navigate("/practice/new")}>התחל תרגול</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[720px] space-y-4 p-4 pb-40">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-[var(--accent-ink)]">
            טעויות
          </h1>
          <p className="text-sm text-stone-600">{items.length} שאלות פתוחות</p>
        </div>
        <Button variant="ghost" onClick={() => navigate("/practice/new")}>
          תרגול חדש
        </Button>
      </header>

      {startError && (
        <Card className="border-red-200 bg-red-50">
          <p className="text-sm text-red-700">{startError}</p>
        </Card>
      )}

      <section className="space-y-3">
        {items.map((q) => {
          const correct = q.correct_answer;
          return (
            <Card key={q.stable_id} className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
                <span>שאלה {q.number}</span>
                <div className="flex gap-2">
                  {q.exam_date && <span>{formatExamDate(q.exam_date)}</span>}
                  {q.part && <span>{PART_LABEL[q.part] ?? q.part}</span>}
                  <span className="text-red-700">
                    {q.times_wrong}/{q.times_answered} טעויות
                  </span>
                </div>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--ink)]">
                {q.body}
              </p>
              <div className="grid gap-2">
                {OPTIONS.map((opt) => (
                  <ReviewOption
                    key={opt}
                    label={opt}
                    text={q.options[opt]}
                    isCorrect={correct === opt}
                    showCorrectHint
                  />
                ))}
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
        })}
      </section>

      <FixedFooter>
        <Button fullWidth disabled={starting} onClick={handlePracticeMistakes}>
          {starting ? "מתחיל…" : "תרגל טעויות"}
        </Button>
      </FixedFooter>
    </div>
  );
};

export default MistakesPage;
