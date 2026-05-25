import { createPortal } from "react-dom";
import { Flag, X } from "lucide-react";
import { cn } from "../../../lib/cn";
import type { SessionQuestion } from "../types";

type CellStatus = "answered" | "flagged" | "current" | "unanswered";

const getCellStatus = (
  index: number,
  question: SessionQuestion,
  currentIndex: number,
  flaggedIndices: Set<number>,
): CellStatus => {
  if (index === currentIndex) return "current";
  if (flaggedIndices.has(index)) return "flagged";
  if (question.answer !== null) return "answered";
  return "unanswered";
};

const CELL_CLASS: Record<CellStatus, string> = {
  current:
    "bg-[var(--accent-ink)] text-[var(--surface)] font-bold ring-2 ring-[var(--accent-ink)] ring-offset-2 ring-offset-[var(--surface)]",
  answered:
    "bg-[var(--accent-ink)]/20 text-[var(--accent-ink)] font-semibold border border-[var(--accent-ink)]/25",
  flagged:
    "bg-amber-400/25 text-amber-700 dark:text-amber-300 ring-1 ring-amber-400/70 font-semibold",
  unanswered:
    "border-2 border-[var(--border-default)] bg-transparent text-[var(--accent-ink)]/50",
};

const PART_LABEL: Record<string, string> = {
  B: "חלק ב׳ · דין דיוני",
  C: "חלק ג׳ · דין מהותי",
};

const questionPart = (q: SessionQuestion): "B" | "C" | null => {
  const match = q.stable_id.match(/^\d{4}-(0[1-9]|1[0-2])_([BC])_/);
  return match ? (match[2] as "B" | "C") : null;
};

type QuestionGridSheetProps = {
  questions: SessionQuestion[];
  currentIndex: number;
  flaggedIndices: Set<number>;
  isSimulation?: boolean;
  onNavigate: (index: number) => void;
  onClose: () => void;
};

const Legend = () => (
  <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-secondary">
    <span className="flex items-center gap-1.5">
      <span className="inline-block h-3 w-3 rounded-full bg-[var(--accent-ink)]" />
      נוכחית
    </span>
    <span className="flex items-center gap-1.5">
      <span className="inline-block h-3 w-3 rounded-full bg-[var(--accent-ink)]/20 ring-1 ring-[var(--accent-ink)]/25" />
      נענתה
    </span>
    <span className="flex items-center gap-1.5">
      <span className="inline-block h-3 w-3 rounded-full bg-amber-400/30 ring-1 ring-amber-400/70" />
      מסומנת
    </span>
    <span className="flex items-center gap-1.5">
      <span className="inline-block h-3 w-3 rounded-full border-2 border-[var(--border-default)]" />
      לא נענתה
    </span>
  </div>
);

const QuestionGridSheet = ({
  questions,
  currentIndex,
  flaggedIndices,
  isSimulation = false,
  onNavigate,
  onClose,
}: QuestionGridSheetProps) => {
  const answeredCount = questions.filter((q) => q.answer !== null).length;
  const flaggedCount = flaggedIndices.size;

  type Group = { part: string | null; items: { q: SessionQuestion; index: number }[] };
  const groups: Group[] = [];

  if (isSimulation) {
    const bItems: Group["items"] = [];
    const cItems: Group["items"] = [];
    questions.forEach((q, index) => {
      const p = questionPart(q);
      if (p === "C") cItems.push({ q, index });
      else bItems.push({ q, index });
    });
    if (bItems.length) groups.push({ part: "B", items: bItems });
    if (cItems.length) groups.push({ part: "C", items: cItems });
  } else {
    groups.push({
      part: null,
      items: questions.map((q, index) => ({ q, index })),
    });
  }

  const sheet = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="ניווט בין שאלות"
        className="fixed inset-x-0 bottom-0 z-[101] max-h-[80vh] overflow-y-auto rounded-t-3xl bg-[var(--surface)] pb-10 pt-5 shadow-2xl"
      >
        {/* Handle */}
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[var(--border-subtle)]" />

        <div className="px-4 sm:px-6">
          {/* Header */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-base font-bold text-[var(--accent-ink)]">
                ניווט שאלות
              </h2>
              <p className="mt-0.5 tabular-nums text-xs text-secondary">
                {answeredCount} / {questions.length} נענו
                {flaggedCount > 0 && ` · ${flaggedCount} מסומנות`}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="focus-ring flex h-9 w-9 items-center justify-center rounded-full bg-[var(--surface-muted)] text-secondary"
              aria-label="סגור"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 mb-5">
            <Legend />
          </div>

          {/* Groups */}
          <div className="space-y-5">
            {groups.map((group) => (
              <div key={group.part ?? "all"}>
                {group.part && (
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-secondary">
                    {PART_LABEL[group.part] ?? group.part}
                    <span className="mr-2 tabular-nums font-normal">
                      ({group.items.filter((it) => it.q.answer !== null).length}/{group.items.length})
                    </span>
                  </p>
                )}
                <div className="grid grid-cols-8 gap-2 sm:grid-cols-10">
                  {group.items.map(({ q, index }) => {
                    const status = getCellStatus(index, q, currentIndex, flaggedIndices);
                    const isFlagged = flaggedIndices.has(index);

                    return (
                      <button
                        key={q.stable_id}
                        type="button"
                        onClick={() => {
                          onNavigate(index);
                          onClose();
                        }}
                        className={cn(
                          "relative flex h-10 w-full items-center justify-center rounded-xl text-xs transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ink)]/40",
                          CELL_CLASS[status],
                        )}
                        aria-label={`שאלה ${index + 1}`}
                        aria-current={index === currentIndex ? "true" : undefined}
                      >
                        {index + 1}
                        {isFlagged && (
                          <Flag
                            className="absolute -top-1 -right-1 h-3 w-3 fill-amber-500 text-amber-500"
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(sheet, document.body);
};

export default QuestionGridSheet;
