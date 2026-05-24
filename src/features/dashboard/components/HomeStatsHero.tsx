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
  onClick?: () => void;
};

const StatCard = ({ label, value, sub, onClick }: StatCardProps) => (
  <div
    role={onClick ? "button" : undefined}
    tabIndex={onClick ? 0 : undefined}
    onClick={onClick}
    onKeyDown={
      onClick
        ? (e) => { if (e.key === "Enter" || e.key === " ") onClick(); }
        : undefined
    }
    className={`flex flex-col gap-1 rounded-2xl border border-default bg-surface px-4 py-4${onClick ? " cursor-pointer transition hover:bg-[var(--surface-muted)] active:scale-[0.98]" : ""}`}
  >
    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary">
      {label}
    </p>
    <p className="font-display text-3xl font-black tabular-nums leading-none text-[var(--accent-ink)]">
      {value}
    </p>
    {sub && (
      <p className="mt-0.5 text-[11px] leading-snug tabular-nums text-secondary">
        {sub}
      </p>
    )}
  </div>
);

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

  const correctAnswers = Math.max(0, stats.total_answered - stats.incorrect_answers);
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
          label="זמן לימוד"
          value={formatStudyTime(stats.total_study_seconds)}
        />
        <StatCard
          label="תרגולים"
          value={stats.practices_completed}
        />
        <StatCard
          label="מבחנים"
          value={stats.exams_completed}
        />
        <StatCard
          label="סימולציות"
          value={stats.simulations_completed}
        />
        <StatCard
          label="טעויות לחזרה"
          value={
            hasMistakes
              ? `${stats.active_mistakes_count} פתוחות`
              : "אין"
          }
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
