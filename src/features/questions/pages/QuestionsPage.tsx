import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import AppHeader from "../../../components/AppHeader";
import AppLoader from "../../../components/loader";
import Button from "../../../components/Button";
import Card from "../../../components/Card";
import ErrorState from "../../../components/ErrorState";
import OptionCard from "../../../components/OptionCard";
import PageShell from "../../../components/PageShell";
import QuestionMeta from "../../../components/QuestionMeta";
import { useExamsList } from "../../exams/hooks/useExamsList";
import type { ExamSummary } from "../../exams/types";
import type { AnswerOption } from "../../sessions/types";
import { useQuestions } from "../hooks/useQuestions";
import type { PracticeQuestion } from "../types";
import { useState } from "react";

const OPTIONS: AnswerOption[] = ["א", "ב", "ג", "ד"];

const PART_LABEL: Record<string, string> = {
  B: "דין דיוני",
  C: "דין מהותי",
};

type Selection = { examDate: string; part: "B" | "C"; label: string };

const ExamPicker = ({
  exams,
  onSelect,
}: {
  exams: ExamSummary[];
  onSelect: (selection: Selection) => void;
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
                className="focus-ring flex items-center justify-between rounded-xl border border-default bg-[var(--surface-muted)] px-4 py-3 text-right transition hover:bg-[var(--surface-hover)]"
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

const QuestionPreview = ({ question }: { question: PracticeQuestion }) => (
  <Card className="space-y-3">
    <div className="flex items-start justify-between gap-3">
      <QuestionMeta
        number={question.number}
        examDate={question.exam_date}
        part={question.part}
      />
      <Link
        to={`/questions/${question.stable_id}`}
        className="focus-ring inline-flex shrink-0 items-center gap-1 rounded-xl px-2 py-1 text-xs font-medium text-secondary transition hover:text-primary"
      >
        פתח
        <ChevronLeft className="h-4 w-4" strokeWidth={2.4} />
      </Link>
    </div>

    {question.invalidation_note && (
      <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
        {question.invalidation_note}
      </p>
    )}

    <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--ink)]">
      {question.body}
    </p>

    <div className="grid gap-2">
      {OPTIONS.map((option) => (
        <OptionCard
          key={option}
          mode="review"
          label={option}
          text={question.options[option]}
        />
      ))}
    </div>
  </Card>
);

const QuestionsPage = () => {
  const [selection, setSelection] = useState<Selection | null>(null);
  const { status: examsStatus, exams, retry: retryExams } = useExamsList();
  const { status, questions, retry } = useQuestions(
    selection?.examDate ?? null,
    selection?.part ?? null,
  );

  const back = selection
    ? {
        onClick: () => setSelection(null),
      }
    : undefined;

  if (examsStatus === "loading") {
    return (
      <PageShell className="pb-8">
        <AppHeader title="מאגר שאלות" />
        <AppLoader variant="list" rows={4} />
      </PageShell>
    );
  }

  if (examsStatus === "error") {
    return (
      <PageShell className="pb-8">
        <AppHeader title="מאגר שאלות" />
        <ErrorState
          message="החיבור נכשל. נסה שוב"
          action={<Button onClick={retryExams}>נסה שוב</Button>}
        />
      </PageShell>
    );
  }

  return (
    <PageShell className="pb-8">
      <div className="space-y-4">
        <AppHeader
          title={selection?.label ?? "מאגר שאלות"}
          back={back}
          meta={
            status === "ready" ? (
              <p className="tabular-nums text-sm text-secondary">
                {questions.length} שאלות
              </p>
            ) : undefined
          }
        />

        {!selection && <ExamPicker exams={exams} onSelect={setSelection} />}

        {selection && status === "loading" && (
          <AppLoader variant="list" rows={6} />
        )}

        {selection && status === "error" && (
          <ErrorState
            message="החיבור נכשל. נסה שוב"
            action={<Button onClick={retry}>נסה שוב</Button>}
          />
        )}

        {selection && status === "ready" && (
          <section className="grid gap-3">
            {questions.map((question) => (
              <QuestionPreview key={question.stable_id} question={question} />
            ))}
          </section>
        )}
      </div>
    </PageShell>
  );
};

export default QuestionsPage;
