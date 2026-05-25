import type { CSSProperties } from "react";
import type { SessionSummary } from "../../sessions/types";

const HEBREW_MONTHS = [
  "ינו׳",
  "פבר׳",
  "מרץ",
  "אפר׳",
  "מאי",
  "יוני",
  "יולי",
  "אוג׳",
  "ספט׳",
  "אוק׳",
  "נוב׳",
  "דצמ׳",
];

const PASSING_SCORE = 60;

const PART_LABEL: Record<"B" | "C", string> = {
  B: "דין דיוני",
  C: "דין מהותי",
};

const MONTH_LABELS: Record<string, string> = {
  "02": "פברואר",
  "04": "אפריל",
  "06": "יוני",
  "09": "ספטמבר",
  "12": "דצמבר",
};

const formatExamLabel = (examDate: string | null | undefined): string => {
  if (!examDate) return "כל המועדים";
  const [year, month] = examDate.split("-");
  if (!year || !month) return examDate;
  return `${MONTH_LABELS[month] ?? month} ${year}`;
};

const formatPartsLabel = (part: string | null | undefined): string => {
  if (!part) return "חלקים ב׳ + ג׳";
  return PART_LABEL[part as "B" | "C"] ?? part;
};

const formatShortDate = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";

  return `${date.getDate()} ${HEBREW_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
};

const formatDuration = (
  startedAt: string | null | undefined,
  completedAt: string | null | undefined,
): string => {
  if (!startedAt || !completedAt) return "—";

  const started = new Date(startedAt).getTime();
  const completed = new Date(completedAt).getTime();

  if (Number.isNaN(started) || Number.isNaN(completed)) return "—";

  const totalMin = Math.max(0, Math.round((completed - started) / 60000));

  if (totalMin < 60) return `${totalMin} דק׳`;

  const hours = Math.floor(totalMin / 60);
  const minutes = totalMin % 60;

  return minutes === 0
    ? `${hours} שע׳`
    : `${hours}:${String(minutes).padStart(2, "0")} שע׳`;
};

const parseScore = (
  value: string | number | null | undefined,
): number | null => {
  if (value === null || value === undefined) return null;

  const score = Number(value);
  if (Number.isNaN(score)) return null;

  return Math.round(score);
};

const scoreColorStyle = (score: number | null): CSSProperties => {
  if (score === null) return {};
  if (score >= PASSING_SCORE) return { color: "var(--color-pass)" };
  if (score >= 40) return { color: "var(--color-warn)" };
  return { color: "var(--color-fail)" };
};

const ScoreBadge = ({
  score: scoreProp,
  maxScore,
}: {
  score: string | number | null | undefined;
  maxScore: number | null | undefined;
}) => {
  const score = parseScore(scoreProp);
  const colorStyle = scoreColorStyle(score);

  const max = maxScore ?? null;

  return (
    <div className="shrink-0 text-left" style={colorStyle}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary">
        ציון
      </p>

      <div className="mt-1 flex items-end justify-end gap-1">
        <span className="font-display text-3xl font-black tabular-nums leading-none">
          {score ?? "—"}
        </span>

        {score !== null && max !== null && (
          <span className="pb-0.5 text-[11px] font-bold leading-none">
            / {max}
          </span>
        )}
      </div>
    </div>
  );
};

const PartScoreCard = ({
  label,
  correct,
  total,
  score: scoreProp,
}: {
  label: string;
  correct: number;
  total: number;
  score: string | number | null | undefined;
}) => {
  const score = parseScore(scoreProp);

  return (
    <div className="rounded-xl border border-default bg-surface-muted px-3 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold text-secondary">{label}</p>

        <p className="text-xs font-semibold tabular-nums text-secondary">
          {correct}/{total}
        </p>
      </div>

      <div className="mt-1 flex items-end gap-1">
        <span className="font-display text-xl font-black tabular-nums text-[var(--accent-ink)]">
          {score ?? "—"}
        </span>

        {score !== null && (
          <span className="pb-0.5 text-[10px] font-bold text-secondary">
            נק׳
          </span>
        )}
      </div>
    </div>
  );
};

type SimulationRowProps = {
  session: SessionSummary;
  isLast: boolean;
};

const SimulationRow = ({ session, isLast }: SimulationRowProps) => {
  const partBreakdown = session.part_breakdown;

  return (
    <article
      className={`px-5 py-4 ${!isLast ? "border-b border-default" : ""}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-primary">
              {formatExamLabel(session.exam_date)}
            </p>

            <span className="rounded-full bg-[var(--color-beige-strong)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-black)]">
              סימולציה
            </span>
          </div>

          <p className="mt-0.5 text-xs font-medium text-secondary">
            {formatPartsLabel(session.part)}
          </p>

          <p className="mt-1 text-xs text-[var(--text-tertiary)]">
            {formatShortDate(session.created_at)} · {session.total_questions}{" "}
            שאלות · {formatDuration(session.started_at, session.completed_at)}
          </p>
        </div>

        <ScoreBadge score={session.score} maxScore={session.max_score} />
      </div>

      {partBreakdown && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {(["B", "C"] as const).map((part) => {
            const data = partBreakdown[part];
            if (!data) return null;

            return (
              <PartScoreCard
                key={part}
                label={PART_LABEL[part]}
                correct={data.correct}
                total={data.total}
                score={data.score}
              />
            );
          })}
        </div>
      )}
    </article>
  );
};

type Props = {
  simulations: SessionSummary[];
};

const SimulationHistoryCard = ({ simulations }: Props) => {
  if (simulations.length === 0) return null;

  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-default bg-surface shadow-sm">
      <header className="border-b border-default bg-surface-muted/60 px-5 py-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary">
          היסטוריית מבחנים
        </h2>
      </header>

      <div>
        {simulations.map((session, index) => (
          <SimulationRow
            key={session.id}
            session={session}
            isLast={index === simulations.length - 1}
          />
        ))}
      </div>
    </section>
  );
};

export default SimulationHistoryCard;
