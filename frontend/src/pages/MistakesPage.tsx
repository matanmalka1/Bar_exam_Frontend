import { useNavigate } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import Button from "../components/Button";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import FixedFooter from "../components/FixedFooter";
import OptionCard from "../components/OptionCard";
import QuestionMeta from "../components/QuestionMeta";
import AppLoader from "../components/loader";
import { useMistakes } from "../features/mistakes/hooks/useMistakes";
import type { AnswerOption } from "../features/sessions/types";

const OPTIONS: AnswerOption[] = ["א", "ב", "ג", "ד"];

const formatExamDate = (raw: string): string => {
  const m = raw.match(/^(\d{4})-(\d{2})/);
  if (!m) return raw;
  return `${m[2]}/${m[1]}`;
};

const MistakesPage = () => {
  const navigate = useNavigate();
  const { status, items, starting, retry, startMistakesPractice } =
    useMistakes();

  if (status === "loading") {
    return (
      <div className="mx-auto w-full max-w-[720px] space-y-4 p-4">
        <AppHeader title="טעויות" />
        <AppLoader variant="list" rows={4} />
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
      <div className="mx-auto w-full max-w-[720px] space-y-4 p-4">
        <AppHeader
          title="טעויות"
          meta={
            <p className="text-sm text-secondary">חזרה על שאלות שטעית בהן</p>
          }
        />
        <Card>
          <EmptyState
            title="אין טעויות עדיין"
            description="טעויות מתרגולים יופיעו כאן לחזרה."
            action={
              <Button onClick={() => navigate("/practice/new")}>
                התחל תרגול
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[720px] space-y-4 p-4 pb-24">
      <AppHeader
        title="טעויות"
        meta={
          <p className="tabular-nums text-sm text-secondary">
            {items.length} שאלות פתוחות
          </p>
        }
        actions={
          <Button
            variant="ghost"
            className="min-h-10 rounded-xl px-3 py-2 text-sm"
            onClick={() => navigate("/practice/new")}
          >
            תרגול חדש
          </Button>
        }
      />

      <section className="space-y-3">
        {items.map((q) => {
          const correct = q.correct_answer;
          return (
            <Card key={q.stable_id} className="space-y-3">
              <QuestionMeta
                number={q.number}
                examDate={q.exam_date ? formatExamDate(q.exam_date) : null}
                part={q.part}
                wrongCount={q.times_wrong}
                totalAnswered={q.times_answered}
              />
              <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--ink)]">
                {q.body}
              </p>
              <div className="grid gap-2">
                {OPTIONS.map((opt) => (
                  <OptionCard
                    key={opt}
                    mode="review"
                    label={opt}
                    text={q.options[opt]}
                    isCorrect={correct === opt}
                    showCorrectBadge
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
