import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Card from "../components/Card";
import ErrorState from "../components/ErrorState";
import FixedFooter from "../components/FixedFooter";
import ReviewOption from "../components/ReviewOption";
import AppLoader from "../components/loader";
import { useMistakes } from "../features/mistakes/hooks/useMistakes";
import type { AnswerOption } from "../features/sessions/types";

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
  const { status, items, starting, startError, retry, startMistakesPractice } =
    useMistakes();

  if (status === "loading") {
    return <AppLoader variant="page" label="טוען נתונים..." />;
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
      <div className="mx-auto w-full max-w-[720px] space-y-4 p-4">
        <header>
          <h1 className="font-display text-3xl font-bold text-[var(--accent-ink)]">
            טעויות
          </h1>
          <p className="text-sm text-secondary">חזרה על שאלות שטעית בהן</p>
        </header>
        <Card className="space-y-3 text-center">
          <h2 className="text-lg font-semibold text-[var(--accent-ink)]">
            אין טעויות עדיין
          </h2>
          <p className="text-sm text-secondary">
            טעויות מתרגולים יופיעו כאן כדי שתוכל לחזור עליהן.
          </p>
          <Button onClick={() => navigate("/practice/new")}>התחל תרגול</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[720px] space-y-4 p-4 pb-24">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-[var(--accent-ink)]">
            טעויות
          </h1>
          <p className="text-sm text-secondary">{items.length} שאלות פתוחות</p>
        </div>
        <Button variant="ghost" onClick={() => navigate("/practice/new")}>
          תרגול חדש
        </Button>
      </header>

      {startError && (
        <Card className="border-2 border-strong bg-white">
          <p className="text-sm text-primary font-semibold">{startError}</p>
        </Card>
      )}

      <section className="space-y-3">
        {items.map((q) => {
          const correct = q.correct_answer;
          return (
            <Card key={q.stable_id} className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-secondary">
                <span>שאלה {q.number}</span>
                <div className="flex gap-2">
                  {q.exam_date && <span>{formatExamDate(q.exam_date)}</span>}
                  {q.part && <span>{PART_LABEL[q.part] ?? q.part}</span>}
                  <span className="text-primary font-semibold">
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
        })}
      </section>

      <FixedFooter>
        <Button fullWidth disabled={starting} onClick={startMistakesPractice}>
          {starting ? (
            <AppLoader variant="button" label="מתחיל..." />
          ) : (
            "תרגל טעויות"
          )}
        </Button>
      </FixedFooter>
    </div>
  );
};

export default MistakesPage;
