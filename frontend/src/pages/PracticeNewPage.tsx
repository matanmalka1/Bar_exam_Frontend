import type { ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Check } from "lucide-react";
import ActionCard from "../components/ActionCard";
import AppHeader from "../components/AppHeader";
import Button from "../components/Button";
import Chip from "../components/Chip";
import ErrorState from "../components/ErrorState";
import FixedFooter from "../components/FixedFooter";
import AppLoader from "../components/loader";
import { useExamsList } from "../features/exams/hooks/useExamsList";
import { usePracticeNewForm } from "../features/sessions/hooks/usePracticeNewForm";
import { cn } from "../lib/cn";

interface StepSectionProps {
  index: string;
  title: string;
  complete: boolean;
  children: ReactNode;
}

const StepSection = ({
  index,
  title,
  complete,
  children,
}: StepSectionProps) => (
  <section className="mt-7">
    <div className="flex items-baseline justify-between gap-2 border-b border-default pb-2">
      <h2 className="font-display flex items-baseline gap-2 text-base font-bold text-[var(--accent-ink)]">
        <span className="text-xs tabular-nums opacity-50">{index}</span>
        <span>{title}</span>
      </h2>
      <span
        className={cn(
          "inline-flex h-5 w-5 items-center justify-center rounded-full transition",
          complete
            ? "bg-[var(--accent-ink)] text-white"
            : "border border-default text-transparent",
        )}
        aria-hidden="true"
      >
        <Check className="h-3 w-3" strokeWidth={3} />
      </span>
    </div>
    <div className="mt-3">{children}</div>
  </section>
);

const PracticeNewPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const flow: "practice" | "exam" =
    searchParams.get("flow") === "exam" ? "exam" : "practice";
  const { status, groups, retry } = useExamsList();
  const {
    part,
    examDate,
    allDates,
    count,
    submitting,
    canSubmit,
    disabledReason,
    dateSelected,
    setPart,
    setCount,
    selectAllDates,
    selectExamDate,
    startExam,
    startPractice,
  } = usePracticeNewForm(flow);

  const goBack = () => navigate(-1);

  if (status === "loading") {
    return <AppLoader variant="page" label="טוען נתונים..." />;
  }

  if (status === "error") {
    return (
      <div className="mx-auto w-full max-w-[720px] p-4">
        <ErrorState
          message="לא ניתן לטעון את רשימת המועדים"
          action={<Button onClick={retry}>נסה שוב</Button>}
        />
      </div>
    );
  }

  if (flow === "exam") {
    return (
      <div className="mx-auto w-full max-w-[720px] p-4 pb-32">
        <AppHeader
          back={{ label: "ביטול", onClick: goBack }}
          eyebrow="תרגול חדש"
          title="בחינת מועד מלאה"
        />

        <p className="text-sm leading-6 text-secondary">
          בחר מועד בחינה. כל השאלות מאותו מועד יוצגו בסדר המקורי, ללא משוב
          מיידי.
        </p>

        <StepSection index="01" title="בחר מועד" complete={examDate !== null}>
          {groups.length === 0 ? (
            <p className="rounded-2xl border border-default bg-[var(--surface-muted)] p-4 text-sm text-secondary">
              אין מועדים זמינים
            </p>
          ) : (
            <div className="grid gap-2">
              {groups.map((g) => {
                const selected = examDate === g.exam_date;
                return (
                  <ActionCard
                    key={g.exam_date}
                    onClick={() => selectExamDate(g.exam_date)}
                    aria-pressed={selected}
                    selected={selected}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-display text-base font-bold text-[var(--accent-ink)]">
                        {g.label}
                      </span>
                      <span className="text-sm tabular-nums text-secondary">
                        {g.total} שאלות
                      </span>
                    </div>
                  </ActionCard>
                );
              })}
            </div>
          )}
        </StepSection>

        <FixedFooter>
          <Button fullWidth disabled={!canSubmit} onClick={startExam}>
            {submitting ? (
              <AppLoader variant="button" label="מתחיל..." />
            ) : (
              "התחל בחינה"
            )}
          </Button>
          {disabledReason && (
            <p className="text-center text-xs text-secondary">
              {disabledReason}
            </p>
          )}
        </FixedFooter>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[720px] p-4 pb-32">
      <AppHeader
        back={{ label: "ביטול", onClick: goBack }}
        eyebrow="תרגול חדש"
        title="תרגול חופשי"
      />

      <p className="text-sm leading-6 text-secondary">
        הרכב סשן תרגול לפי חלק, מועד וכמות שאלות. במצב זה תקבל משוב מיידי על כל
        תשובה.
      </p>

      <StepSection index="01" title="חלק" complete={part !== null}>
        <div className="flex flex-wrap gap-2">
          <Chip selected={part === "B"} onClick={() => setPart("B")}>
            דין דיוני
          </Chip>
          <Chip selected={part === "C"} onClick={() => setPart("C")}>
            דין מהותי
          </Chip>
          <Chip selected={part === "both"} onClick={() => setPart("both")}>
            שני החלקים יחד
          </Chip>
        </div>
      </StepSection>

      {part !== null && (
        <StepSection index="02" title="מועד" complete={dateSelected}>
          <div className="flex flex-wrap gap-2">
            <Chip selected={allDates} onClick={selectAllDates}>
              כל המועדים
            </Chip>
            {groups.map((g) => (
              <Chip
                key={g.exam_date}
                selected={!allDates && examDate === g.exam_date}
                onClick={() => selectExamDate(g.exam_date)}
              >
                {g.label}
              </Chip>
            ))}
          </div>
        </StepSection>
      )}

      {part !== null && dateSelected && (
        <StepSection index="03" title="מספר שאלות" complete={count !== null}>
          <div className="flex flex-wrap gap-2">
            {([10, 20, 40] as const).map((n) => (
              <Chip key={n} selected={count === n} onClick={() => setCount(n)}>
                {n}
              </Chip>
            ))}
            <Chip selected={count === "all"} onClick={() => setCount("all")}>
              כל השאלות
            </Chip>
          </div>
        </StepSection>
      )}

      <FixedFooter>
        <Button fullWidth disabled={!canSubmit} onClick={startPractice}>
          {submitting ? (
            <AppLoader variant="button" label="מתחיל..." />
          ) : (
            "התחל תרגול"
          )}
        </Button>
        {disabledReason && (
          <p className="text-center text-xs text-secondary">{disabledReason}</p>
        )}
      </FixedFooter>
    </div>
  );
};

export default PracticeNewPage;
