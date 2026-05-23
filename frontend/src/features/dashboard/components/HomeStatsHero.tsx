import Button from "../../../components/Button";
import EmptyState from "../../../components/EmptyState";
import type { StatsOverview } from "../../stats/types";
import { toNumber } from "../dashboardFormat";

type HomeStatsHeroProps = {
  stats: StatsOverview | null;
  onStartPractice: () => void;
};

const HomeStatsHero = ({ stats, onStartPractice }: HomeStatsHeroProps) => {
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

  return (
    <section className="mt-7" aria-label="אחוז הצלחה כולל">
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary">
            אחוז הצלחה כולל
          </p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-display text-[5.25rem] font-black leading-none tabular-nums text-[var(--accent-ink)]">
              {successRateDisplay}
            </span>
            <span className="font-display text-3xl font-bold text-secondary">
              %
            </span>
          </div>
        </div>
        <div className="pb-2 text-left">
          <p className="text-[11px] uppercase tracking-[0.18em] text-secondary">
            נענו
          </p>
          <p className="font-display mt-1 text-2xl font-bold tabular-nums text-[var(--accent-ink)]">
            {stats.total_answered}
          </p>
        </div>
      </div>

      <div className="mt-4 h-[3px] w-full overflow-hidden rounded-full bg-black/10">
        <div
          className="h-full rounded-full bg-black transition-all duration-500"
          style={{
            width: `${Math.min(100, Math.max(0, successRateNum ?? 0))}%`,
          }}
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
    </section>
  );
};

export default HomeStatsHero;
