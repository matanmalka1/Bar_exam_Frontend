import Button from "../../../components/Button";
import EmptyState from "../../../components/EmptyState";
import type { StatsOverview } from "../../stats/types";

type HomeStatsHeroProps = {
  stats: StatsOverview | null;
  onStartPractice: () => void;
  onOpenMistakes: () => void;
};

type StatCardProps = {
  label: string;
  value: number | string;
  sub?: string;
  highlight?: boolean;
  onClick?: () => void;
};

const StatCard = ({ label, value, sub, highlight, onClick }: StatCardProps) => {
  const base =
    "flex flex-col gap-1 rounded-2xl border border-default bg-surface px-4 py-4";
  const interactive = onClick
    ? "cursor-pointer transition hover:bg-[var(--surface-muted)] active:scale-[0.98]"
    : "";
  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onClick();
            }
          : undefined
      }
      className={`${base} ${interactive}`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary">
        {label}
      </p>
      <p
        className={`font-display text-3xl font-black tabular-nums leading-none ${highlight ? "text-red-600" : "text-[var(--accent-ink)]"}`}
      >
        {value}
      </p>
      {sub && (
        <p className="mt-0.5 text-[11px] leading-snug tabular-nums text-secondary">
          {sub}
        </p>
      )}
    </div>
  );
};

const formatStudyTime = (seconds: number): string => {
  if (seconds === 0) return "—";
  if (seconds < 60) return "פחות מדקה";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h === 0) return `${m} דק׳`;
  if (m === 0) return `${h} שע׳`;
  return `${h}:${String(m).padStart(2, "0")} שע׳`;
};

const HomeStatsHero = ({
  stats,
  onStartPractice,
  onOpenMistakes,
}: HomeStatsHeroProps) => {
  if (!stats || stats.total_answered === 0) {
    return (
      <section className="mt-7">
        <EmptyState
          title="טרם התחלת לתרגל"
          description="בחר חלק וצא לדרך."
          action={<Button onClick={onStartPractice}>התחל תרגול</Button>}
        />
      </section>
    );
  }

  const sessionsCompleted =
    stats.practices_completed + stats.exams_completed + stats.simulations_completed;

  const correctAnswers = Math.max(0, stats.total_answered - stats.incorrect_answers);

  const sessionsSub = [
    stats.practices_completed > 0
      ? `${stats.practices_completed} תרגולים`
      : null,
    stats.exams_completed > 0 ? `${stats.exams_completed} מבחנים` : null,
    stats.simulations_completed > 0
      ? `${stats.simulations_completed} סימולציות`
      : null,
  ]
    .filter(Boolean)
    .join(" · ") || "—";

  const hasMistakes = stats.active_mistakes_count > 0;

  return (
    <section className="mt-7" aria-label="סיכום פעילות">
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="שאלות נענו"
          value={stats.total_answered}
          sub={`${correctAnswers} נכונות · ${stats.incorrect_answers} שגויות`}
        />
        <StatCard
          label="מפגשים"
          value={sessionsCompleted}
          sub={sessionsSub}
        />
        <StatCard
          label="טעויות פתוחות"
          value={stats.active_mistakes_count}
          sub={hasMistakes ? undefined : "אין טעויות פתוחות"}
          highlight={hasMistakes}
          onClick={hasMistakes ? onOpenMistakes : undefined}
        />
        <StatCard
          label="זמן לימוד"
          value={formatStudyTime(stats.total_study_seconds)}
        />
      </div>

      {hasMistakes && (
        <button
          type="button"
          onClick={onOpenMistakes}
          className="mt-4 w-full rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-right text-sm font-medium text-amber-800 transition hover:bg-amber-100"
        >
          יש לך {stats.active_mistakes_count} טעויות פתוחות — רוצה לחזור עליהן?
        </button>
      )}
    </section>
  );
};

export default HomeStatsHero;
