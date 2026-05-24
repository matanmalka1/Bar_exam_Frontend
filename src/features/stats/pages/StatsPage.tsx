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

const PART_FULL_LABEL: Record<string, string> = {
  B: "דין דיוני",
  C: "דין מהותי",
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
  if (seconds === null || seconds <= 0) return "";
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
  const date = s.exam_date ?? "";
  const part = s.part ? (PART_LABEL[s.part] ?? s.part) : "";

  return [mode, date, part].filter(Boolean).join(" · ");
};

const getScore = (s: SessionSummary): number | null => {
  if (s.score_percent === null || s.score_percent === undefined) return null;
  return Math.round(Number(s.score_percent));
};

const getIncorrectCount = (s: SessionSummary): number | null => {
  if (s.correct_count === null || s.correct_count === undefined) return null;
  return Math.max(0, s.answered_count - s.correct_count);
};

type SummaryCardProps = {
  label: string;
  value: string | number;
  sub?: string;
  tone?: "default" | "accent" | "warning";
};

const SummaryCard = ({
  label,
  value,
  sub,
  tone = "default",
}: SummaryCardProps) => {
  const toneClass =
    tone === "accent"
      ? "bg-[var(--accent)]/10"
      : tone === "warning"
        ? "bg-surface-muted"
        : "bg-surface";

  return (
    <div
      className={`min-h-[112px] rounded-3xl border border-default px-4 py-4 shadow-sm ${toneClass}`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary">
        {label}
      </p>

      <p className="mt-2 font-display text-3xl font-black tabular-nums leading-none text-[var(--accent-ink)]">
        {value}
      </p>

      {sub && (
        <p className="mt-2 text-[11px] leading-snug tabular-nums text-secondary">
          {sub}
        </p>
      )}
    </div>
  );
};

type SectionHeaderProps = {
  title: string;
  sub?: string;
};

const SectionHeader = ({ title, sub }: SectionHeaderProps) => (
  <div>
    <h2 className="font-display text-base font-black text-[var(--accent-ink)]">
      {title}
    </h2>
    {sub && <p className="mt-1 text-xs text-secondary">{sub}</p>}
  </div>
);

type NoticeProps = {
  children: React.ReactNode;
};

const Notice = ({ children }: NoticeProps) => (
  <p className="rounded-3xl border border-default bg-surface-muted px-4 py-4 text-xs leading-relaxed text-secondary">
    {children}
  </p>
);

type PartProgressCardProps = {
  part: "B" | "C";
  totalAnswered: number;
  successRate: number | null;
};

const PartProgressCard = ({
  part,
  totalAnswered,
  successRate,
}: PartProgressCardProps) => {
  const roundedRate = successRate !== null ? Math.round(successRate) : null;
  const barWidth =
    roundedRate !== null ? Math.min(100, Math.max(0, roundedRate)) : 0;

  return (
    <div className="rounded-3xl border border-default bg-surface px-4 py-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-secondary">
            {PART_LABEL[part]}
          </p>
          <p className="mt-1 font-display text-lg font-black text-[var(--accent-ink)]">
            {PART_FULL_LABEL[part]}
          </p>
        </div>

        <p className="font-display text-2xl font-black tabular-nums text-[var(--accent-ink)]">
          {roundedRate !== null ? `${roundedRate}%` : "—"}
        </p>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-muted">
        <div
          className="h-full rounded-full bg-[var(--accent-ink)]"
          style={{ width: `${barWidth}%` }}
        />
      </div>

      <p className="mt-3 text-xs tabular-nums text-secondary">
        {totalAnswered === 0
          ? "אין עדיין תשובות בחלק הזה"
          : `${totalAnswered} שאלות נענו`}
      </p>
    </div>
  );
};

type SessionRowProps = {
  session: SessionSummary;
};

const SessionRow = ({ session: s }: SessionRowProps) => {
  const correct = s.correct_count ?? null;
  const incorrect = getIncorrectCount(s);
  const durationText = formatDuration(sessionDurationSeconds(s));
  const score = getScore(s);
  const dateText = s.completed_at ? formatDate(s.completed_at) : "";

  return (
    <li className="border-b border-default py-4 last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-[var(--accent-ink)]">
            {sessionTitle(s)}
          </p>

          {(dateText || durationText) && (
            <p className="mt-1 text-[11px] text-secondary">
              {[dateText, durationText].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>

        {score !== null && (
          <div className="shrink-0 rounded-full border border-default bg-surface-muted px-3 py-1 text-xs font-bold tabular-nums text-[var(--accent-ink)]">
            {score} נק׳
          </div>
        )}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-2xl bg-surface-muted px-2 py-2">
          <p className="text-[10px] text-secondary">נכונות</p>
          <p className="text-sm font-bold tabular-nums text-[var(--accent-ink)]">
            {correct ?? "—"}
          </p>
        </div>

        <div className="rounded-2xl bg-surface-muted px-2 py-2">
          <p className="text-[10px] text-secondary">שגויות</p>
          <p className="text-sm font-bold tabular-nums text-[var(--accent-ink)]">
            {incorrect ?? "—"}
          </p>
        </div>

        <div className="rounded-2xl bg-surface-muted px-2 py-2">
          <p className="text-[10px] text-secondary">שאלות</p>
          <p className="text-sm font-bold tabular-nums text-[var(--accent-ink)]">
            {s.answered_count}/{s.total_questions}
          </p>
        </div>
      </div>
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
      <div className="space-y-7">
        <AppHeader title="סטטיסטיקות" />

        {overviewUnavailable && (
          <Notice>לא ניתן לטעון נתוני סטטיסטיקות כרגע.</Notice>
        )}

        {overview && (
          <>
            <section className="space-y-3">
              <SectionHeader
                title="סיכום כללי"
                sub="תמונה מהירה של ההתקדמות שלך עד עכשיו"
              />

              <div className="grid grid-cols-2 gap-3">
                <SummaryCard
                  label="שאלות נענו"
                  value={overview.total_answered}
                  tone="accent"
                  sub={
                    overview.total_answered > 0
                      ? `${Math.max(
                          0,
                          overview.total_answered - overview.incorrect_answers,
                        )} נכונות · ${overview.incorrect_answers} שגויות`
                      : "עדיין אין תשובות"
                  }
                />

                <SummaryCard
                  label="זמן לימוד"
                  value={formatTotalStudy(overview.total_study_seconds)}
                  tone="accent"
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
                  tone={
                    overview.active_mistakes_count > 0 ? "warning" : "default"
                  }
                />
              </div>
            </section>

            <section className="space-y-3">
              <SectionHeader
                title="פירוט לפי חלק"
                sub="איפה אתה חזק ואיפה צריך לחזור"
              />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <PartProgressCard
                  part="B"
                  totalAnswered={overview.part_b.total_answered}
                  successRate={overview.part_b.success_rate}
                />

                <PartProgressCard
                  part="C"
                  totalAnswered={overview.part_c.total_answered}
                  successRate={overview.part_c.success_rate}
                />
              </div>
            </section>
          </>
        )}

        <section className="space-y-3">
          <SectionHeader
            title="היסטוריית מפגשים"
            sub="מבחנים, תרגולים וסימולציות שהושלמו"
          />

          {sessionsUnavailable ? (
            <Notice>לא ניתן לטעון היסטוריה כרגע.</Notice>
          ) : sessions.length === 0 ? (
            <Notice>אין מפגשים שהושלמו עדיין.</Notice>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-default bg-surface px-4 shadow-sm">
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
