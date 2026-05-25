import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import AppHeader from "../../../components/AppHeader";
import Button from "../../../components/Button";
import Card from "../../../components/Card";
import ErrorState from "../../../components/ErrorState";
import OptionCard from "../../../components/OptionCard";
import PageShell from "../../../components/PageShell";
import QuestionMeta from "../../../components/QuestionMeta";
import ReferenceBox from "../../../components/ReferenceBox";
import AppLoader from "../../../components/loader";
import { useExamsList } from "../../exams/hooks/useExamsList";
import { useReview } from "../hooks/useReview";
import type { ExamSummary } from "../../exams/types";
import type { ReviewQuestion } from "../types";
import type { AnswerOption } from "../../sessions/types";
import { cn } from "../../../lib/cn";

const OPTIONS: AnswerOption[] = ["א", "ב", "ג", "ד"];

const PART_LABEL: Record<string, string> = {
  B: "דין דיוני",
  C: "דין מהותי",
};

type Selection = { examDate: string; part: "B" | "C"; label: string };

const ExamList = ({
  exams,
  onSelect,
}: {
  exams: ExamSummary[];
  onSelect: (s: Selection) => void;
}) => {
  const grouped = new Map<string, { label: string; parts: ExamSummary[] }>();
  for (const exam of exams) {
    if (!grouped.has(exam.exam_date)) {
      grouped.set(exam.exam_date, { label: exam.label, parts: [] });
    }
    grouped.get(exam.exam_date)!.parts.push(exam);
  }

  return (
    <section className="grid gap-3">
      {[...grouped.entries()].map(([examDate, { label, parts }]) => (
        <Card key={examDate} className="space-y-3">
          <p className="font-display font-semibold text-primary">{label}</p>
          <div className="grid gap-2">
            {parts.map((exam) => (
              <button
                key={exam.part}
                type="button"
                onClick={() =>
                  onSelect({
                    examDate,
                    part: exam.part as "B" | "C",
                    label: `${label} · ${PART_LABEL[exam.part]}`,
                  })
                }
                className="flex items-center justify-between rounded-xl border border-default bg-[var(--surface-muted)] px-4 py-3 text-right transition hover:bg-[var(--surface-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ink)]/30"
              >
                <span className="text-sm font-medium text-primary">
                  {PART_LABEL[exam.part]}
                </span>
                <span className="flex items-center gap-1 text-xs text-secondary">
                  {exam.question_count} שאלות
                  <ChevronLeft className="h-4 w-4" strokeWidth={2} />
                </span>
              </button>
            ))}
          </div>
        </Card>
      ))}
    </section>
  );
};

const ReviewItem = ({
  question,
  open,
  onToggle,
}: {
  question: ReviewQuestion;
  open: boolean;
  onToggle: () => void;
}) => {
  const panelId = `review-${question.stable_id}`;
  const reference = question.reference?.trim();

  return (
    <Card className="space-y-3">
      <QuestionMeta
        number={question.number}
        examDate={question.exam_date}
        part={question.part}
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

      {question.invalidation_note && (
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
          {question.invalidation_note}
        </p>
      )}

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
                isCorrect={question.correct_answer === opt}
                showCorrectBadge
              />
            ))}
          </div>
          {reference && <ReferenceBox reference={reference} />}
        </div>
      )}
    </Card>
  );
};

const ReviewPage = () => {
  const [selection, setSelection] = useState<Selection | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const { status: examsStatus, exams, retry: retryExams } = useExamsList();
  const { status: reviewStatus, questions, retry: retryReview } = useReview(
    selection?.examDate ?? null,
    selection?.part ?? null,
  );

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleBack = () => {
    setSelection(null);
    setExpanded(new Set());
  };

  if (examsStatus === "loading") {
    return (
      <PageShell className="pb-8">
        <AppHeader title="עיון בשאלות" />
        <AppLoader variant="list" rows={4} />
      </PageShell>
    );
  }

  if (examsStatus === "error") {
    return (
      <PageShell className="pb-8">
        <AppHeader title="עיון בשאלות" />
        <ErrorState
          message="החיבור נכשל. נסה שוב"
          action={<Button onClick={retryExams}>נסה שוב</Button>}
        />
      </PageShell>
    );
  }

  if (!selection) {
    return (
      <PageShell className="pb-8">
        <div className="space-y-4">
          <AppHeader title="עיון בשאלות" />
          <ExamList exams={exams} onSelect={setSelection} />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell className="pb-8">
      <div className="space-y-4">
        <AppHeader
          title={selection.label}
          back={{ onClick: handleBack }}
          meta={
            reviewStatus === "ready" ? (
              <p className="tabular-nums text-sm text-secondary">
                {questions.length} שאלות
              </p>
            ) : undefined
          }
        />

        {reviewStatus === "loading" && <AppLoader variant="list" rows={6} />}

        {reviewStatus === "error" && (
          <ErrorState
            message="החיבור נכשל. נסה שוב"
            action={<Button onClick={retryReview}>נסה שוב</Button>}
          />
        )}

        {reviewStatus === "ready" && (
          <section className="grid gap-3">
            {questions.map((q) => (
              <ReviewItem
                key={q.stable_id}
                question={q}
                open={expanded.has(q.stable_id)}
                onToggle={() => toggle(q.stable_id)}
              />
            ))}
          </section>
        )}
      </div>
    </PageShell>
  );
};

export default ReviewPage;
