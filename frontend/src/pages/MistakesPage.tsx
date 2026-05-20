import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Card from "../components/Card";
import ErrorState from "../components/ErrorState";
import { getMistakes } from "../features/mistakes/api";
import type { MistakeItem } from "../features/mistakes/types";
import { createMistakesSession } from "../features/sessions/api";
import type { AnswerOption } from "../features/sessions/types";

type Status = "loading" | "ready" | "error";

const OPTIONS: AnswerOption[] = ["א", "ב", "ג", "ד"];

const PART_LABEL: Record<string, string> = {
  B: "דין דיוני",
  C: "דין מהותי",
};

const formatExamDate = (raw: string): string => {
  // backend uses YYYY-MM
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
      if (axios.isAxiosError(err) && err.response?.status === 422) {
        setStartError("אין טעויות זמינות לתרגול");
      } else {
        setStartError("לא ניתן להתחיל תרגול טעויות כרגע");
      }
    } finally {
      setStarting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="mx-auto w-full max-w-[720px] p-4">
        <p className="text-stone-600">טוען...</p>
      </div>
    );
  }

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
      <div className="mx-auto w-full max-w-[720px] p-4 space-y-4">
        <header className="flex items-center justify-between">
          <span className="w-16" />
          <h1 className="font-display text-2xl font-bold text-[var(--accent-ink)]">
            טעויות
          </h1>
          <span className="w-16" />
        </header>
        <Card className="text-center space-y-3">
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
    <div className="mx-auto w-full max-w-[720px] p-4 pb-32 space-y-4">
      <header className="flex items-center justify-between">
        <span className="w-16" />
        <h1 className="font-display text-2xl font-bold text-[var(--accent-ink)]">
          טעויות ({items.length})
        </h1>
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
              <div className="grid gap-1.5">
                {OPTIONS.map((opt) => {
                  const isCor = correct === opt;
                  return (
                    <div
                      key={opt}
                      className={
                        "rounded-lg border p-2 text-sm " +
                        (isCor
                          ? "border-green-500 bg-green-50 text-green-900"
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
        })}
      </section>

      <div className="fixed inset-x-0 bottom-0 border-t border-[#e2d5c2] bg-white/90 p-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] shadow-[0_-10px_30px_rgba(79,31,64,0.08)] backdrop-blur">
        <div className="mx-auto w-full max-w-[720px]">
          <Button
            fullWidth
            disabled={starting}
            onClick={handlePracticeMistakes}
          >
            {starting ? "מתחיל…" : "תרגל טעויות"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MistakesPage;
