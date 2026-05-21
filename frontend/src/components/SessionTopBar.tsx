import { Bookmark, ChevronRight } from "lucide-react";
import { cn } from "../lib/cn";

interface SessionTopBarProps {
  modeLabel: string;
  currentIndex: number;
  total: number;
  answeredCount: number;
  isBookmarked: boolean;
  bookmarkBusy: boolean;
  onBack: () => void;
  onToggleBookmark: () => void;
}

const pad2 = (n: number): string => String(n).padStart(2, "0");

const SessionTopBar = ({
  modeLabel,
  currentIndex,
  total,
  answeredCount,
  isBookmarked,
  bookmarkBusy,
  onBack,
  onToggleBookmark,
}: SessionTopBarProps) => {
  const safeTotal = Math.max(total, 1);
  const progressPct = Math.min(100, (answeredCount / safeTotal) * 100);

  return (
    <header className="sticky top-0 z-20 -mx-4 -mt-4 mb-4 border-b border-default bg-[var(--paper)]/85 px-4 pt-4 pb-3 backdrop-blur supports-[backdrop-filter]:bg-[var(--paper)]/70">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBack}
          className="focus-ring -mr-2 inline-flex items-center gap-1 rounded-xl px-2 py-1.5 text-sm font-medium text-secondary transition hover:text-primary active:scale-95"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
          חזרה
        </button>

        <p className="font-display text-[11px] uppercase tracking-[0.22em] text-secondary">
          {modeLabel}
        </p>

        <button
          type="button"
          onClick={onToggleBookmark}
          disabled={bookmarkBusy}
          aria-label={isBookmarked ? "הסר סימניה" : "הוסף סימניה"}
          aria-pressed={isBookmarked}
          className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-full text-secondary transition hover:bg-[var(--surface-muted)] hover:text-primary disabled:opacity-50 active:scale-95"
        >
          <Bookmark
            className={cn(
              "h-5 w-5 transition-colors",
              isBookmarked && "text-primary",
              bookmarkBusy && "animate-pulse",
            )}
            fill={isBookmarked ? "currentColor" : "none"}
            strokeWidth={isBookmarked ? 2 : 1.8}
            aria-hidden="true"
          />
        </button>
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="font-display flex items-baseline gap-1.5 tabular-nums">
          <span className="text-[2rem] font-black leading-none text-[var(--accent-ink)]">
            {pad2(currentIndex + 1)}
          </span>
          <span className="text-base font-medium text-secondary">
            / {pad2(total)}
          </span>
        </p>
        <span className="text-[11px] uppercase tracking-[0.18em] text-secondary tabular-nums">
          נענו {answeredCount}/{total}
        </span>
      </div>

      <div className="mt-2 h-[3px] w-full overflow-hidden rounded-full bg-black/10">
        <div
          className="h-full rounded-full bg-[var(--accent-ink)] transition-all duration-500 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </header>
  );
};

export default SessionTopBar;
