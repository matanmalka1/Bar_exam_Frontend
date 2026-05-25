import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import ActionCard from "../../../components/ActionCard";
import AppHeader from "../../../components/AppHeader";
import AppLoader from "../../../components/loader";
import Button from "../../../components/Button";
import Card from "../../../components/Card";
import ErrorState from "../../../components/ErrorState";
import OptionCard from "../../../components/OptionCard";
import PageShell from "../../../components/PageShell";
import QuestionMeta from "../../../components/QuestionMeta";
import ReferenceBox from "../../../components/ReferenceBox";
import { useExamsList } from "../../exams/hooks/useExamsList";
import type { ExamSummary } from "../../exams/types";
import type { AnswerOption } from "../../sessions/types";
import { useQuestions } from "../hooks/useQuestions";
import { getQuestionsForReview } from "../api";
import type { PracticeQuestion, ReviewQuestionDetail } from "../types";
import { useState } from "react";
import { cn } from "../../../lib/cn";
import { setToggle } from "../../../lib/set-toggle";

const OPTIONS: AnswerOption[] = ["א", "ב", "ג", "ד"];

const PART_LABEL: Record<string, string> = {
  B: "דין דיוני",
  C: "דין מהותי",
};

const PART_HINT: Record<string, string> = {
  B: "סדר הדין האזרחי והפלילי",
  C: "דיני חוזים, נזיקין, קניין ועוד",
};

type Selection = { examDate: string; part: "B" | "C"; label: string };
type ViewMode = "practice" | "review";

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
    <section className="space-y-6">
      {[...grouped.entries()].map(([examDate, { label, parts }]) => (
        <div key={examDate}>
          <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-secondary">
            {label}
          </p>
          <div className="grid gap-2.5">
            {parts.map((exam) => (
              <ActionCard
                key={exam.part}
                onClick={() =>
                  onSelect({
                    examDate,
                    part: exam.part as "B" | "C",
                    label: `${label} · ${PART_LABEL[exam.part]}`,
                  })
                }
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display text-base font-bold text-[var(--accent-ink)]">
                      {PART_LABEL[exam.part]}
                    </p>
                    <p className="mt-0.5 text-[13px] text-secondary">
                      {PART_HINT[exam.part]}
                    </p>
                  </div>
                  <span className="shrink-0 tabular-nums text-sm text-secondary">
                    {exam.question_count} שאלות
                  </span>
                </div>
              </ActionCard>
            ))}
          </div>
        </div>
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

const ReviewPreview = ({
  question,
  open,
  onToggle,
}: {
  question: ReviewQuestionDetail;
  open: boolean;
  onToggle: () => void;
}) => {
  const panelId = `review-${question.stable_id}`;
  const reference = question.reference?.trim();
  const isInvalidated = !!question.invalidation_note;

  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <QuestionMeta
          number={question.number}
          examDate={question.exam_date}
          part={question.part}
        />
        <Link
          to={`/questions/${question.stable_id}/review`}
          className="focus-ring inline-flex shrink-0 items-center gap-1 rounded-xl px-2 py-1 text-xs font-medium text-secondary transition hover:text-primary"
        >
          פתח
          <ChevronLeft className="h-4 w-4" strokeWidth={2.4} />
        </Link>
      </div>

      {isInvalidated && (
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
          {question.invalidation_note}
        </p>
      )}

      <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--ink)]">
        {question.body}
      </p>

      {!isInvalidated && (
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
      )}

      {open && !isInvalidated && (
        <div id={panelId} className="space-y-3">
          <div className="grid gap-2">
            {OPTIONS.map((option) => (
              <OptionCard
                key={option}
                mode="review"
                label={option}
                text={question.options[option]}
                isCorrect={question.correct_answer === option}
                showCorrectBadge
              />
            ))}
          </div>
          {reference && <ReferenceBox reference={reference} />}
        </div>
      )}

      {isInvalidated && (
        <div id={panelId} className="grid gap-2">
          {OPTIONS.map((option) => (
            <OptionCard
              key={option}
              mode="review"
              label={option}
              text={question.options[option]}
            />
          ))}
        </div>
      )}
    </Card>
  );
};

const QuestionsPage = () => {
  const [selection, setSelection] = useState<Selection | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("practice");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const { status: examsStatus, exams, retry: retryExams } = useExamsList();
  const { status, questions, retry } = useQuestions(
    selection?.examDate ?? null,
    selection?.part ?? null,
  );
  const [reviewState, setReviewState] = useState<{
    status: "idle" | "loading" | "ready" | "error";
    questions: ReviewQuestionDetail[];
  }>({ status: "idle", questions: [] });

  const loadReviewQuestions = async (nextSelection = selection) => {
    if (!nextSelection) return;
    setReviewState({ status: "loading", questions: [] });
    try {
      const data = await getQuestionsForReview(
        nextSelection.examDate,
        nextSelection.part,
      );
      setReviewState({ status: "ready", questions: data });
    } catch {
      setReviewState({ status: "error", questions: [] });
    }
  };

  const back = selection
    ? {
        onClick: () => {
          setSelection(null);
          setExpanded(new Set());
        },
      }
    : undefined;

  const selectExam = (nextSelection: Selection) => {
    setSelection(nextSelection);
    setExpanded(new Set());
    setReviewState({ status: "idle", questions: [] });
    if (viewMode === "review") {
      void loadReviewQuestions(nextSelection);
    }
  };

  const changeMode = (nextMode: ViewMode) => {
    setViewMode(nextMode);
    setExpanded(new Set());
    if (nextMode === "review" && reviewState.status === "idle") {
      void loadReviewQuestions();
    }
  };

  const toggle = (id: string) => setExpanded((prev) => setToggle(prev, id));

  const activeStatus = viewMode === "review" ? reviewState.status : status;
  const activeCount =
    viewMode === "review" ? reviewState.questions.length : questions.length;

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
            selection && activeStatus === "ready" ? (
              <p className="tabular-nums text-sm text-secondary">
                {activeCount} שאלות
              </p>
            ) : undefined
          }
        />

        {!selection && (
          <>
            <p className="rounded-2xl border border-default bg-[var(--surface-muted)] px-4 py-3 text-sm leading-6 text-secondary">
              בחר מועד וחלק לצפייה בשאלות. ניתן לעבור בין מצב עיון רגיל לצפייה
              בתשובות.
            </p>
            <ExamPicker exams={exams} onSelect={selectExam} />
          </>
        )}

        {selection && (
          <div className="grid grid-cols-2 rounded-2xl border border-default bg-[var(--surface-muted)] p-1">
            <button
              type="button"
              onClick={() => changeMode("practice")}
              className={cn(
                "focus-ring rounded-xl px-3 py-2 text-sm font-semibold transition",
                viewMode === "practice"
                  ? "bg-surface text-primary shadow-sm"
                  : "text-secondary hover:text-primary",
              )}
            >
              שאלות
            </button>
            <button
              type="button"
              onClick={() => changeMode("review")}
              className={cn(
                "focus-ring rounded-xl px-3 py-2 text-sm font-semibold transition",
                viewMode === "review"
                  ? "bg-surface text-primary shadow-sm"
                  : "text-secondary hover:text-primary",
              )}
            >
              עיון ותשובות
            </button>
          </div>
        )}

        {selection && activeStatus === "loading" && (
          <AppLoader variant="list" rows={6} />
        )}

        {selection && activeStatus === "error" && (
          <ErrorState
            message="החיבור נכשל. נסה שוב"
            action={
              <Button
                onClick={
                  viewMode === "review"
                    ? () => void loadReviewQuestions()
                    : retry
                }
              >
                נסה שוב
              </Button>
            }
          />
        )}

        {selection && viewMode === "practice" && status === "ready" && (
          <section className="grid gap-3">
            {questions.map((question) => (
              <QuestionPreview key={question.stable_id} question={question} />
            ))}
          </section>
        )}

        {selection &&
          viewMode === "review" &&
          reviewState.status === "ready" && (
            <section className="grid gap-3">
              {reviewState.questions.map((question) => (
                <ReviewPreview
                  key={question.stable_id}
                  question={question}
                  open={expanded.has(question.stable_id)}
                  onToggle={() => toggle(question.stable_id)}
                />
              ))}
            </section>
          )}
      </div>
    </PageShell>
  );
};

export default QuestionsPage;
