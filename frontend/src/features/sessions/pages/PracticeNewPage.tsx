import type { ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Check } from "lucide-react";
import ActionCard from "../../../components/ActionCard";
import AppHeader from "../../../components/AppHeader";
import Button from "../../../components/Button";
import Chip from "../../../components/Chip";
import ErrorState from "../../../components/ErrorState";
import FixedFooter from "../../../components/FixedFooter";
import PageShell from "../../../components/PageShell";
import AppLoader from "../../../components/loader";
import { useExamsList } from "../../exams/hooks/useExamsList";
import { usePracticeNewForm } from "../hooks/usePracticeNewForm";
import { cn } from "../../../lib/cn";

interface StepSectionProps {
  index: string;
  title: string;
  complete: boolean;
  children: ReactNode;
}

const IntroBox = ({ children }: { children: ReactNode }) => (
  <p className="mt-4 rounded-2xl border border-default bg-[var(--surface-muted)] px-4 py-3 text-sm leading-6 text-secondary">
    {children}
  </p>
);

const StepSection = ({
  index,
  title,
  complete,
  children,
}: StepSectionProps) => (
  <section
    className={cn(
      "mt-5 rounded-[1.5rem] border bg-surface p-4 transition",
      complete ? "border-[var(--accent-ink)]/25" : "border-default",
    )}
  >
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold tabular-nums",
            complete
              ? "bg-[var(--accent-ink)] text-white"
              : "border border-default bg-[var(--surface-muted)] text-secondary",
          )}
        >
          {index}
        </span>

        <h2 className="font-display text-base font-bold text-[var(--accent-ink)]">
          {title}
        </h2>
      </div>

      <span
        className={cn(
          "inline-flex h-6 w-6 items-center justify-center rounded-full transition",
          complete
            ? "bg-[var(--accent-ink)] text-white"
            : "border border-default text-transparent",
        )}
        aria-hidden="true"
      >
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </span>
    </div>

    <div className="mt-4">{children}</div>
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
      <PageShell className="pb-32">
        <ErrorState
          message="לא ניתן לטעון את רשימת המועדים"
          action={<Button onClick={retry}>נסה שוב</Button>}
        />
      </PageShell>
    );
  }

  if (flow === "exam") {
    return (
      <PageShell className="pb-32">
        <AppHeader
          back={{ label: "ביטול", onClick: goBack }}
          eyebrow="תרגול חדש"
          title="בחינת מועד מלאה"
        />

        <IntroBox>
          בחר מועד בחינה. כל השאלות מאותו מועד יוצגו בסדר המקורי, ללא משוב
          מיידי.
        </IntroBox>

        <StepSection index="01" title="בחר מועד" complete={examDate !== null}>
          {groups.length === 0 ? (
            <p className="rounded-2xl border border-default bg-[var(--surface-muted)] p-4 text-sm text-secondary">
              אין מועדים זמינים
            </p>
          ) : (
            <div className="grid gap-2.5">
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
      </PageShell>
    );
  }

  return (
    <PageShell className="pb-32">
      <AppHeader
        back={{ label: "ביטול", onClick: goBack }}
        eyebrow="תרגול חדש"
        title="תרגול חופשי"
      />

      <IntroBox>
        הרכב סשן תרגול לפי חלק, מועד וכמות שאלות. במצב זה תקבל משוב מיידי על
        כל תשובה.
      </IntroBox>

      <StepSection index="01" title="חלק" complete={part !== null}>
        <div className="flex flex-wrap gap-2.5">
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
          <div className="flex flex-wrap gap-2.5">
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
          <div className="flex flex-wrap gap-2.5">
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
          <p className="text-center text-xs text-secondary">
            {disabledReason}
          </p>
        )}
      </FixedFooter>
    </PageShell>
  );
};

export default PracticeNewPage;