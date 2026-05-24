import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import AppHeader from "../../../components/AppHeader";
import Button from "../../../components/Button";
import Card from "../../../components/Card";
import EmptyState from "../../../components/EmptyState";
import ErrorState from "../../../components/ErrorState";
import FixedFooter from "../../../components/FixedFooter";
import OptionCard from "../../../components/OptionCard";
import PageShell from "../../../components/PageShell";
import QuestionMeta from "../../../components/QuestionMeta";
import ReferenceBox from "../../../components/ReferenceBox";
import AppLoader from "../../../components/loader";
import { useMistakes } from "../hooks/useMistakes";
import type { AnswerOption } from "../../sessions/types";
import { cn } from "../../../lib/cn";

const OPTIONS: AnswerOption[] = ["א", "ב", "ג", "ד"];

const formatExamDate = (raw: string): string => {
  const match = raw.match(/^(\d{4})-(\d{2})/);
  if (!match) return raw;

  return `${match[2]}/${match[1]}`;
};

const MistakeItem = ({
  question,
  open,
  onToggle,
}: {
  question: ReturnType<typeof useMistakes>["items"][number];
  open: boolean;
  onToggle: () => void;
}) => {
  const correct = question.correct_answer;
  const panelId = `mistake-${question.stable_id}`;

  return (
    <Card className="space-y-3">
      <QuestionMeta
        number={question.number}
        examDate={question.exam_date ? formatExamDate(question.exam_date) : null}
        part={question.part}
        wrongCount={question.times_wrong}
        totalAnswered={question.times_answered}
      />

      <button
        type="button"
        className="w-full rounded-xl text-right focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ink)]/30"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
      >
        <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--ink)]">
          {question.body}
        </p>
      </button>

      <button
        type="button"
        className="inline-flex items-center gap-1 rounded-xl px-1 py-1 text-xs font-medium text-secondary transition hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ink)]/30"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
      >
        <ChevronLeft
          className={cn("h-4 w-4 transition-transform", open && "-rotate-90")}
          strokeWidth={2.4}
        />
        {open ? "הסתר תשובה" : "הצג תשובה"}
      </button>

      {open && (
        <div id={panelId} className="space-y-3">
          <div className="grid gap-2">
            {OPTIONS.map((opt) => (
              <OptionCard
                key={opt}
                mode="review"
                label={opt}
                text={question.options[opt]}
                isCorrect={correct === opt}
                showCorrectBadge
              />
            ))}
          </div>

          {question.reference && <ReferenceBox reference={question.reference} />}
        </div>
      )}
    </Card>
  );
};

const MistakesPage = () => {
  const navigate = useNavigate();
  const { status, items, starting, retry, startMistakesPractice } =
    useMistakes();

  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  if (status === "loading") {
    return (
      <PageShell className="pb-6">
        <div className="space-y-4">
          <AppHeader title="טעויות" />
          <AppLoader variant="list" rows={4} />
        </div>
      </PageShell>
    );
  }

  if (status === "error") {
    return (
      <PageShell className="pb-6">
        <ErrorState
          message="לא ניתן לטעון את הטעויות"
          action={<Button onClick={retry}>נסה שוב</Button>}
        />
      </PageShell>
    );
  }

  if (items.length === 0) {
    return (
      <PageShell className="pb-6">
        <div className="space-y-4">
          <AppHeader
            title="טעויות"
            meta={
              <p className="text-sm text-secondary">חזרה על שאלות שטעית בהן</p>
            }
          />

          <Card className="surface-muted">
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
      </PageShell>
    );
  }

  return (
    <PageShell className="pb-28">
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

      <section className="mt-4 space-y-3">
        {items.map((question) => (
          <MistakeItem
            key={question.stable_id}
            question={question}
            open={expanded.has(question.stable_id)}
            onToggle={() => toggle(question.stable_id)}
          />
        ))}
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
    </PageShell>
  );
};

export default MistakesPage;