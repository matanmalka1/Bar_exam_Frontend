import { Flame } from "lucide-react";
import { cn } from "../../../lib/cn";
import type { StreakResult } from "../computeStreak";

const StreakDot = ({
  label,
  active,
  isToday,
}: {
  label: string;
  active: boolean;
  isToday: boolean;
}) => (
  <div className="flex flex-col items-center gap-1.5">
    <div
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full border text-[11px] font-bold transition-all duration-300",
        active
          ? "border-[var(--accent-ink)] bg-[var(--accent-ink)] text-[var(--on-accent)]"
          : isToday
            ? "border-[var(--accent-ink)] bg-transparent text-[var(--accent-ink)]"
            : "border-[var(--border-subtle)] bg-[var(--surface-muted)] text-[var(--text-tertiary)]",
      )}
    >
      {active ? "✓" : label}
    </div>
    <span
      className={cn(
        "text-[9px] font-semibold uppercase tracking-[0.1em]",
        isToday ? "text-[var(--accent-ink)]" : "text-[var(--text-tertiary)]",
      )}
    >
      {label}
    </span>
  </div>
);

interface StreakCardProps {
  streak: StreakResult;
}

const StreakCard = ({ streak }: StreakCardProps) => {
  const { currentStreak, longestStreak, weekDays, activeDaysThisWeek } = streak;

  const flameColor =
    currentStreak >= 7
      ? "text-orange-400"
      : currentStreak >= 3
        ? "text-amber-400"
        : "text-[var(--text-tertiary)]";

  return (
    <section
      className="overflow-hidden rounded-[var(--radius-2xl)] border border-default bg-surface shadow-[var(--shadow-default)]"
      aria-label="רצף לימוד"
    >
      {/* Header row */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <Flame
            className={cn("h-5 w-5 shrink-0 transition-colors", flameColor)}
            strokeWidth={2.2}
            aria-hidden="true"
          />
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-secondary">
            רצף לימוד
          </span>
        </div>

        <div className="flex items-baseline gap-1">
          <span className="font-display tabular-nums text-2xl font-black leading-none text-[var(--accent-ink)]">
            {currentStreak}
          </span>
          <span className="text-xs text-secondary">
            {currentStreak === 1 ? "יום" : "ימים"}
          </span>
        </div>
      </div>

      {/* Week dots */}
      <div
        className="flex items-end justify-between px-5 pb-4"
        role="list"
        aria-label="פעילות השבוע"
      >
        {weekDays.map((day) => (
          <div key={day.date} role="listitem">
            <StreakDot
              label={day.label}
              active={day.active}
              isToday={day.isToday}
            />
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-default px-5 py-2.5">
        <span className="tabular-nums text-[11px] text-secondary">
          {activeDaysThisWeek}/7 ימים השבוע
        </span>
        {longestStreak > 1 && (
          <span className="tabular-nums text-[11px] text-secondary">
            שיא: {longestStreak} ימים
          </span>
        )}
      </div>
    </section>
  );
};

export default StreakCard;
