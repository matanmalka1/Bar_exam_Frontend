import { useEffect, useState } from "react";
import AppHeader from "../../../components/AppHeader";
import AppLoader from "../../../components/loader";
import PageShell from "../../../components/PageShell";
import { getStatsOverview } from "../api";
import { useSessionHistory } from "../hooks/useSessionHistory";
import type { StatsOverview } from "../types";
import type { SessionSummary } from "../../sessions/types";

const PART_LABEL: Record<string, string> = {
  B: "חלק ב׳",
  C: "חלק ג׳",
};

const MODE_LABEL: Record<string, string> = {
  practice: "תרגול",
  exam: "מבחן מועד",
  simulation: "סימולציה",
  mistakes: "חזרה על טעויות",
  bookmarks: "חזרה על סימניות",
};

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
};

const formatDuration = (seconds: number | null): string => {
  if (seconds === null) return "";
  if (seconds <= 0) return "";
  if (seconds < 60) return "פחות מדקה";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h === 0) return `${m} דק׳`;
  return `${h}:${String(m).padStart(2, "0")} שע׳`;
};

const formatTotalStudy = (seconds: number): string => {
  if (seconds === 0) return "—";
  if (seconds < 60) return "פחות מדקה";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h === 0) return `${m} דק׳`;
  if (m === 0) return `${h} שע׳`;
  return `${h}:${String(m).padStart(2, "0")} שע׳`;
};

const sessionDurationSeconds = (s: SessionSummary): number | null => {
  if (!s.started_at || !s.completed_at) return null;
  const diff =
    (new Date(s.completed_at).getTime() - new Date(s.started_at).getTime()) /
    1000;
  return diff > 0 ? Math.round(diff) : null;
};

const sessionTitle = (s: SessionSummary): string => {
  const mode = MODE_LABEL[s.mode] ?? s.mode;
  const part = s.part ? PART_LABEL[s.part] ?? "" : "";
  const date = s.exam_date ?? "";
  const parts = [mode, date, part].filter(Boolean);
  return parts.join(" · ");
};

type SummaryCardProps = { label: string; value: string | number; sub?: string };
const SummaryCard = ({ label, value, sub }: SummaryCardProps) => (
  <div className="flex flex-col gap-1 rounded-2xl border border-default bg-surface px-4 py-4">
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

type SessionRowProps = { session: SessionSummary };
const SessionRow = ({ session: s }: SessionRowProps) => {
  const correct = s.correct_count ?? null;
  const incorrect =
    correct !== null ? Math.max(0, s.answered_count - correct) : null;
  const duration = sessionDurationSeconds(s);
  const durationText = formatDuration(duration);
  const scoreNum =
    s.score_percent !== null && s.score_percent !== undefined
      ? Math.round(Number(s.score_percent))
      : null;
  const dateText = s.completed_at ? formatDate(s.completed_at) : "";

  return (
    <li className="flex flex-col gap-0.5 border-b border-default py-3 last:border-b-0">
      {/* Row 1: title + score */}
      <div className="flex items-baseline justify-between gap-2">
        <span className="truncate text-sm font-semibold text-[var(--accent-ink)]">
          {sessionTitle(s)}
        </span>
        {scoreNum !== null && (
          <span className="shrink-0 text-xs font-semibold tabular-nums text-secondary">
            {`ציון: ${scoreNum} נק׳`}
          </span>
        )}
      </div>

      {/* Row 2: date + duration */}
      {(dateText || durationText) && (
        <p className="text-[11px] text-secondary">
          {[dateText, durationText].filter(Boolean).join(" · ")}
        </p>
      )}

      {/* Row 3: correct/incorrect + questions count */}
      <p className="text-[12px] tabular-nums text-secondary">
        {correct !== null && incorrect !== null
          ? `${correct} נכונות · ${incorrect} שגויות · `
          : ""}
        {s.answered_count} / {s.total_questions} שאלות
      </p>
    </li>
  );
};

const StatsPage = () => {
  const [overview, setOverview] = useState<StatsOverview | null>(null);
  const [overviewUnavailable, setOverviewUnavailable] = useState(false);
  const {
    sessions,
    loading: sessionsLoading,
    unavailable: sessionsUnavailable,
  } = useSessionHistory();

  useEffect(() => {
    getStatsOverview()
      .then(setOverview)
      .catch(() => setOverviewUnavailable(true));
  }, []);

  const overviewLoading = overview === null && !overviewUnavailable;

  if (overviewLoading || sessionsLoading) {
    return (
      <PageShell>
        <AppHeader title="סטטיסטיקות" />
        <AppLoader variant="page" label="טוען נתונים..." />
      </PageShell>
    );
  }

  return (
    <PageShell className="pb-8">
      <div className="space-y-6">
        <AppHeader title="סטטיסטיקות" />

        {overviewUnavailable && (
          <p className="rounded-2xl border border-default bg-surface-muted px-4 py-3 text-xs text-secondary">
            לא ניתן לטעון נתוני סטטיסטיקות כרגע.
          </p>
        )}

        {overview && (
          <>
            <section className="space-y-3">
              <h2 className="font-display text-sm font-bold text-[var(--accent-ink)]">
                סיכום כללי
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <SummaryCard
                  label="שאלות נענו"
                  value={overview.total_answered}
                  sub={
                    overview.total_answered > 0
                      ? `${Math.max(0, overview.total_answered - overview.incorrect_answers)} נכונות · ${overview.incorrect_answers} שגויות`
                      : "עדיין אין תשובות"
                  }
                />
                <SummaryCard
                  label="זמן לימוד"
                  value={formatTotalStudy(overview.total_study_seconds)}
                />
                <SummaryCard
                  label="תרגולים"
                  value={overview.practices_completed}
                />
                <SummaryCard
                  label="מבחני מועד"
                  value={overview.exams_completed}
                />
                <SummaryCard
                  label="סימולציות"
                  value={overview.simulations_completed}
                />
                <SummaryCard
                  label="טעויות פתוחות"
                  value={overview.active_mistakes_count}
                />
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-sm font-bold text-[var(--accent-ink)]">
                פירוט לפי חלק
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <SummaryCard
                  label="חלק ב׳ · דין דיוני"
                  value={overview.part_b.total_answered}
                  sub={
                    overview.part_b.total_answered === 0
                      ? "אין נתונים"
                      : overview.part_b.success_rate !== null
                        ? `${Math.round(overview.part_b.success_rate)}% נכון`
                        : "אין נתונים"
                  }
                />
                <SummaryCard
                  label="חלק ג׳ · דין מהותי"
                  value={overview.part_c.total_answered}
                  sub={
                    overview.part_c.total_answered === 0
                      ? "אין נתונים"
                      : overview.part_c.success_rate !== null
                        ? `${Math.round(overview.part_c.success_rate)}% נכון`
                        : "אין נתונים"
                  }
                />
              </div>
            </section>
          </>
        )}

        <section className="space-y-3">
          <h2 className="font-display text-sm font-bold text-[var(--accent-ink)]">
            היסטוריית מפגשים
          </h2>
          {sessionsUnavailable ? (
            <p className="rounded-2xl border border-default bg-surface-muted px-4 py-3 text-xs text-secondary">
              לא ניתן לטעון היסטוריה כרגע.
            </p>
          ) : sessions.length === 0 ? (
            <p className="rounded-2xl border border-default bg-surface-muted px-4 py-3 text-xs text-secondary">
              אין מפגשים שהושלמו עדיין.
            </p>
          ) : (
            <div className="rounded-2xl border border-default bg-surface px-4">
              <ul>
                {sessions.map((s) => (
                  <SessionRow key={s.id} session={s} />
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </PageShell>
  );
};

export default StatsPage;
