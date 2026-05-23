import type { StatsOverview } from "../../stats/types";
import { formatPercent } from "../dashboardFormat";

type PartCellProps = {
  label: string;
  answered: number;
  rate: number | null;
};

const PartCell = ({ label, answered, rate }: PartCellProps) => (
  <div className="surface px-4 py-4">
    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-secondary">
      {label}
    </p>
    <div className="mt-2 flex items-baseline justify-between gap-2">
      <span className="font-display text-2xl font-black tabular-nums text-[var(--accent-ink)]">
        {formatPercent(rate)}
      </span>
      <span className="text-xs tabular-nums text-secondary">
        {answered} שאלות
      </span>
    </div>
  </div>
);

type PartBreakdownProps = {
  stats: StatsOverview | null;
  statsUnavailable: boolean;
};

const PartBreakdown = ({ stats, statsUnavailable }: PartBreakdownProps) => {
  if (!stats) {
    return statsUnavailable ? (
      <p className="mt-9 text-center text-xs text-secondary">
        נתוני התקדמות לא זמינים כרגע.
      </p>
    ) : null;
  }

  return (
    <section
      className="mt-9 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-default bg-black/10"
      aria-label="פירוט לפי חלקי הבחינה"
    >
      <PartCell
        label="דין דיוני · חלק ב׳"
        answered={stats.part_b.total_answered}
        rate={stats.part_b.success_rate}
      />
      <PartCell
        label="דין מהותי · חלק ג׳"
        answered={stats.part_c.total_answered}
        rate={stats.part_c.success_rate}
      />
    </section>
  );
};

export default PartBreakdown;
