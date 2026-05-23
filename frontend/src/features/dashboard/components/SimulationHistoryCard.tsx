import type { SessionSummary } from "../../sessions/types";
import { formatPercent } from "../dashboardFormat";

const HEBREW_MONTHS = [
  "ינו׳","פבר׳","מרץ","אפר׳","מאי","יוני",
  "יולי","אוג׳","ספט׳","אוק׳","נוב׳","דצמ׳",
];

const formatShortDate = (iso: string): string => {
  const d = new Date(iso);
  return `${d.getDate()} ${HEBREW_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

const formatDuration = (startedAt: string, completedAt: string | null): string => {
  if (!completedAt) return "—";
  const ms = new Date(completedAt).getTime() - new Date(startedAt).getTime();
  const totalMin = Math.round(ms / 60000);
  if (totalMin < 60) return `${totalMin} דק׳`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m === 0 ? `${h} שע׳` : `${h}:${String(m).padStart(2, "0")} שע׳`;
};

const ScoreBadge = ({
  correct,
  total,
}: {
  correct: number | null;
  total: number;
}) => {
  const pct = correct !== null && total > 0 ? (correct / total) * 100 : null;
  const color =
    pct === null ? "text-secondary" :
    pct >= 65 ? "text-green-700" :
    pct >= 50 ? "text-amber-600" :
    "text-red-600";
  const label = correct !== null ? `${correct}/${total}` : "—";
  return (
    <span className={`font-display text-2xl font-black tabular-nums ${color}`}>
      {label}
    </span>
  );
};

type SimulationRowProps = { session: SessionSummary; isLast: boolean };

const SimulationRow = ({ session, isLast }: SimulationRowProps) => {
  const pb = session.part_breakdown;
  return (
    <div className={`px-5 py-4 ${!isLast ? "border-b border-default" : ""}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-secondary">
            {formatShortDate(session.created_at)}
          </span>
          <span className="text-xs text-secondary">
            {session.total_questions} שאלות ·{" "}
            {formatDuration(session.started_at, session.completed_at)}
          </span>
        </div>
        <ScoreBadge correct={session.correct_count} total={session.total_questions} />
      </div>

      {pb && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {(["B", "C"] as const).map((part) => {
            const data = pb[part];
            if (!data) return null;
            return (
              <div
                key={part}
                className="rounded-xl bg-surface-muted px-3 py-2"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-secondary">
                  {part === "B" ? "דין דיוני" : "דין מהותי"}
                </p>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="font-display text-base font-black tabular-nums text-[var(--accent-ink)]">
                    {formatPercent(data.score_percent)}
                  </span>
                  <span className="text-[10px] tabular-nums text-secondary">
                    {data.correct}/{data.total}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

type Props = {
  simulations: SessionSummary[];
};

const SimulationHistoryCard = ({ simulations }: Props) => {
  if (simulations.length === 0) return null;

  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-default bg-surface">
      <div className="border-b border-default px-5 py-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary">
          היסטוריית מבחנים
        </h2>
      </div>
      {simulations.map((s, i) => (
        <SimulationRow
          key={s.id}
          session={s}
          isLast={i === simulations.length - 1}
        />
      ))}
    </section>
  );
};

export default SimulationHistoryCard;
