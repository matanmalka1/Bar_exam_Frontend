import Button from "../../../components/Button";
import EmptyState from "../../../components/EmptyState";
import type { StatsOverview } from "../../stats/types";
import { toNumber } from "../dashboardFormat";

type HomeStatsHeroProps = {
  stats: StatsOverview | null;
  onStartPractice: () => void;
  onOpenMistakes: () => void;
};

const rateColor = (rate: number): string => {
  if (rate >= 65) return "text-green-700";
  if (rate >= 45) return "text-amber-600";
  return "text-red-600";
};

const barColor = (rate: number): string => {
  if (rate >= 65) return "bg-green-700";
  if (rate >= 45) return "bg-amber-500";
  return "bg-red-500";
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
          description="בחר חלק וצא לדרך. אחוז ההצלחה שלך יופיע כאן."
          action={<Button onClick={onStartPractice}>התחל תרגול</Button>}
        />
      </section>
    );
  }

  const successRateNum = toNumber(stats.overall_success_rate);
  const successRateDisplay =
    successRateNum === null ? "—" : Math.round(successRateNum);
  const barWidth = Math.min(100, Math.max(4, successRateNum ?? 0));
  const colorClass =
    successRateNum !== null ? rateColor(successRateNum) : "text-[var(--accent-ink)]";
  const barClass =
    successRateNum !== null ? barColor(successRateNum) : "bg-black";

  return (
    <section className="mt-7" aria-label="אחוז הצלחה כולל">
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary">
            אחוז הצלחה כולל
          </p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span
              className={`font-display text-[5.25rem] font-black leading-none tabular-nums ${colorClass}`}
            >
              {successRateDisplay}
            </span>
            <span className={`font-display text-3xl font-bold ${colorClass}`}>
              %
            </span>
          </div>
        </div>
        <div className="pb-2 text-left">
          <p className="text-[11px] uppercase tracking-[0.18em] text-secondary">
            תורגלו
          </p>
          <p className="font-display mt-1 text-2xl font-bold tabular-nums text-[var(--accent-ink)]">
            {stats.total_answered}
          </p>
        </div>
      </div>

      <div className="mt-4 h-[3px] w-full overflow-hidden rounded-full bg-black/10">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barClass}`}
          style={{ width: `${barWidth}%` }}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[12px] text-secondary">
        <span className="tabular-nums">
          {stats.active_mistakes_count} טעויות פתוחות
        </span>
        <span className="tabular-nums">
          {stats.simulations_completed} סימולציות הושלמו
        </span>
      </div>

      {stats.active_mistakes_count > 0 && (
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
