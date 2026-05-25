import { useEffect, useState } from "react";
import {
  Activity,
  BookOpenCheck,
  Clock3,
  Flame,
  ListChecks,
  Medal,
  RotateCcw,
  Target,
  Trophy,
  XCircle,
} from "lucide-react";
import AppHeader from "../../../components/AppHeader";
import AppLoader from "../../../components/loader";
import PageShell from "../../../components/PageShell";
import { getStatsOverview } from "../api";
import { useSessionHistory } from "../hooks/useSessionHistory";
import type { StatsOverview } from "../types";
import type { SessionSummary } from "../../sessions/types";
import {
  formatOptionalDuration,
  formatStudyTime,
} from "../../../lib/time-format";

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
  if (s.score === null || s.score === undefined) return null;
  return Math.round(Number(s.score));
};

const getIncorrectCount = (s: SessionSummary): number | null => {
  if (s.correct_count === null || s.correct_count === undefined) return null;
  return Math.max(0, s.answered_count - s.correct_count);
};

const formatPercent = (value: number | null): string =>
  value === null ? "—" : `${Math.round(value)}%`;

const getPartGap = (overview: StatsOverview): number | null => {
  if (
    overview.part_b.success_rate === null ||
    overview.part_c.success_rate === null
  ) {
    return null;
  }

  return Math.abs(
    Math.round(overview.part_b.success_rate) -
      Math.round(overview.part_c.success_rate),
  );
};

const getFocusPart = (overview: StatsOverview): "B" | "C" | null => {
  const b = overview.part_b.success_rate;
  const c = overview.part_c.success_rate;

  if (b === null && c === null) return null;
  if (b === null) return "B";
  if (c === null) return "C";
  if (b === c) return null;
  return b < c ? "B" : "C";
};

const getStrongPart = (overview: StatsOverview): "B" | "C" | null => {
  const b = overview.part_b.success_rate;
  const c = overview.part_c.success_rate;

  if (b === null && c === null) return null;
  if (b === null) return "C";
  if (c === null) return "B";
  if (b === c) return null;
  return b > c ? "B" : "C";
};

const getModeCounts = (sessions: SessionSummary[]) =>
  sessions.reduce<Record<string, number>>((acc, session) => {
    acc[session.mode] = (acc[session.mode] ?? 0) + 1;
    return acc;
  }, {});

const getAverageSessionScore = (sessions: SessionSummary[]): number | null => {
  const scores = sessions
    .map(getScore)
    .filter((score): score is number => score !== null);

  if (scores.length === 0) return null;
  return Math.round(
    scores.reduce((sum, score) => sum + score, 0) / scores.length,
  );
};

const getLastCompletedDate = (sessions: SessionSummary[]): string | null => {
  const latest = sessions.find((session) => Boolean(session.completed_at));
  return latest?.completed_at ? formatDate(latest.completed_at) : null;
};

type SummaryCardProps = {
  label: string;
  value: string | number;
  sub?: string;
  tone?: "default" | "accent" | "warning";
  icon?: React.ReactNode;
};

const SummaryCard = ({
  label,
  value,
  sub,
  tone = "default",
  icon,
}: SummaryCardProps) => {
  const toneClass =
    tone === "accent"
      ? "bg-[var(--accent)] text-[var(--on-accent)]"
      : tone === "warning"
        ? "bg-[var(--amber-50)]"
        : "bg-surface";
  const mutedClass = tone === "accent" ? "text-[var(--on-accent)]/70" : "text-secondary";
  const valueClass =
    tone === "accent" ? "text-[var(--on-accent)]" : "text-[var(--accent-ink)]";
  const iconClass =
    tone === "accent"
      ? "border-[var(--on-accent)]/15 bg-[var(--on-accent)]/10 text-[var(--on-accent)]"
      : tone === "warning"
        ? "border-[var(--amber-300)] bg-[var(--amber-50)] text-[var(--amber-800)]"
        : "border-default bg-surface-muted text-[var(--accent-ink)]";

  return (
    <div
      className={`min-h-[124px] rounded-[var(--radius-xl)] border border-default px-4 py-4 shadow-sm ${toneClass}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p
          className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${mutedClass}`}
        >
          {label}
        </p>

        {icon && (
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border ${iconClass}`}
          >
            {icon}
          </div>
        )}
      </div>

      <p
        className={`mt-3 font-display text-3xl font-black tabular-nums leading-none ${valueClass}`}
      >
        {value}
      </p>

      {sub && (
        <p
          className={`mt-2 text-[11px] leading-snug tabular-nums ${mutedClass}`}
        >
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
  <p className="rounded-[var(--radius-xl)] border border-default bg-surface-muted px-4 py-4 text-xs leading-relaxed text-secondary">
    {children}
  </p>
);

type InsightCardProps = {
  icon: React.ReactNode;
  title: string;
  value: string;
  detail: string;
};

const InsightCard = ({ icon, title, value, detail }: InsightCardProps) => (
  <div className="rounded-[var(--radius-xl)] border border-default bg-surface px-4 py-4 shadow-sm">
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-surface-muted text-[var(--accent-ink)]">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary">
          {title}
        </p>
        <p className="mt-1 font-display text-2xl font-black tabular-nums leading-none text-[var(--accent-ink)]">
          {value}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-secondary">{detail}</p>
      </div>
    </div>
  </div>
);

type PartProgressCardProps = {
  part: "B" | "C";
  totalAnswered: number;
  successRate: number | null;
  genuineCorrect: number;
  invalidatedCredits: number;
  incorrectAnswers: number;
  focus?: boolean;
  strong?: boolean;
};

const PartProgressCard = ({
  part,
  totalAnswered,
  successRate,
  genuineCorrect,
  invalidatedCredits,
  incorrectAnswers,
  focus = false,
  strong = false,
}: PartProgressCardProps) => {
  const roundedRate = successRate !== null ? Math.round(successRate) : null;
  const barWidth =
    roundedRate !== null ? Math.min(100, Math.max(0, roundedRate)) : 0;
  const answeredText =
    totalAnswered === 0
      ? "אין עדיין תשובות בחלק הזה"
      : `${totalAnswered} תשובות נענו בחלק הזה`;

  return (
    <div className="rounded-[var(--radius-xl)] border border-default bg-surface px-4 py-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-secondary">
            {PART_LABEL[part]}
          </p>
          <p className="mt-1 font-display text-lg font-black text-[var(--accent-ink)]">
            {PART_FULL_LABEL[part]}
          </p>
        </div>

        <div className="text-left">
          <p className="font-display text-3xl font-black tabular-nums leading-none text-[var(--accent-ink)]">
            {roundedRate !== null ? `${roundedRate}%` : "—"}
          </p>
          {(focus || strong) && (
            <p className="mt-1 text-[10px] font-bold text-secondary">
              {focus ? "דורש חיזוק" : "החלק החזק"}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-muted">
        <div
          className="h-full rounded-full bg-[var(--accent-ink)]"
          style={{ width: `${barWidth}%` }}
        />
      </div>

      <p className="mt-3 text-xs tabular-nums text-secondary">{answeredText}</p>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-2xl bg-surface-muted px-2 py-2">
          <p className="text-[10px] text-secondary">נכונות</p>
          <p className="text-sm font-bold tabular-nums text-[var(--accent-ink)]">
            {genuineCorrect}
          </p>
        </div>
        <div className="rounded-2xl bg-surface-muted px-2 py-2">
          <p className="text-[10px] text-secondary">פסילה</p>
          <p className="text-sm font-bold tabular-nums text-[var(--accent-ink)]">
            {invalidatedCredits}
          </p>
        </div>
        <div className="rounded-2xl bg-surface-muted px-2 py-2">
          <p className="text-[10px] text-secondary">שגויות</p>
          <p className="text-sm font-bold tabular-nums text-[var(--accent-ink)]">
            {incorrectAnswers}
          </p>
        </div>
      </div>
    </div>
  );
};

type ModeBreakdownProps = {
  sessions: SessionSummary[];
};

const ModeBreakdown = ({ sessions }: ModeBreakdownProps) => {
  const counts = getModeCounts(sessions);
  const items = Object.entries(MODE_LABEL).map(([mode, label]) => ({
    mode,
    label,
    count: counts[mode] ?? 0,
  }));
  const max = Math.max(...items.map((item) => item.count), 1);

  return (
    <div className="rounded-[var(--radius-xl)] border border-default bg-surface px-4 py-4 shadow-sm">
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.mode}>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <p className="text-xs font-bold text-[var(--accent-ink)]">
                {item.label}
              </p>
              <p className="text-xs font-bold tabular-nums text-secondary">
                {item.count}
              </p>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
              <div
                className="h-full rounded-full bg-[var(--accent-ink)]"
                style={{ width: `${(item.count / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

type SessionRowProps = {
  session: SessionSummary;
};

const SessionRow = ({ session: s }: SessionRowProps) => {
  const correct = s.correct_count ?? null;
  const incorrect = getIncorrectCount(s);
  const durationText = formatOptionalDuration(sessionDurationSeconds(s));
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

        <div className="shrink-0 text-left">
          {score !== null && (
            <div className="rounded-full border border-default bg-surface-muted px-3 py-1 text-xs font-bold tabular-nums text-[var(--accent-ink)]">
              {score} נק׳
            </div>
          )}
          {s.score !== null && s.max_score !== null && (
            <p className="mt-1 text-[10px] tabular-nums text-secondary">
              מתוך {s.max_score}
            </p>
          )}
        </div>
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
  const latestCompletedDate = getLastCompletedDate(sessions);
  const averageSessionScore = getAverageSessionScore(sessions);
  const partGap = overview ? getPartGap(overview) : null;
  const focusPart = overview ? getFocusPart(overview) : null;
  const strongPart = overview ? getStrongPart(overview) : null;
  const repeatAttempts =
    overview === null
      ? 0
      : Math.max(
          0,
          overview.total_answer_attempts - overview.unique_answered_questions,
        );
  const bIncorrect =
    overview === null
      ? 0
      : Math.max(
          0,
          overview.part_b.total_answered -
            overview.part_b.genuine_correct_answers -
            overview.part_b.invalidated_credit_answers,
        );
  const cIncorrect =
    overview === null
      ? 0
      : Math.max(
          0,
          overview.part_c.total_answered -
            overview.part_c.genuine_correct_answers -
            overview.part_c.invalidated_credit_answers,
        );

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
        <AppHeader
          eyebrow="מעקב התקדמות"
          title="סטטיסטיקות"
          meta={
            latestCompletedDate ? (
              <span className="rounded-full border border-default bg-surface px-3 py-1 text-[11px] font-semibold text-secondary">
                עודכן {latestCompletedDate}
              </span>
            ) : null
          }
        />

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

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <SummaryCard
                  label="שאלות נענו"
                  value={overview.total_answered}
                  tone="accent"
                  icon={<ListChecks className="h-5 w-5" aria-hidden="true" />}
                  sub={
                    overview.total_answered > 0
                      ? `${overview.genuine_correct_answers} נכונות  · ${overview.invalidated_credit_answers} נקודות פסילה · ${overview.incorrect_answers} שגויות`
                      : "עדיין אין תשובות"
                  }
                />

                <SummaryCard
                  label="זמן לימוד"
                  value={formatStudyTime(overview.total_study_seconds)}
                  tone="accent"
                  icon={<Clock3 className="h-5 w-5" aria-hidden="true" />}
                />

                <SummaryCard
                  label="דיוק כללי"
                  value={formatPercent(overview.overall_success_rate)}
                  sub="כולל נקודות פסילה בציון"
                  icon={<Target className="h-5 w-5" aria-hidden="true" />}
                />

                <SummaryCard
                  label="שליטה נקייה"
                  value={formatPercent(overview.mastery_rate)}
                  sub="תשובות נכונות ללא נקודות פסילה"
                  icon={<Medal className="h-5 w-5" aria-hidden="true" />}
                />

                <SummaryCard
                  label="שאלות ייחודיות"
                  value={overview.unique_answered_questions}
                  sub={`${overview.total_answer_attempts} ניסיונות תשובה בסך הכל`}
                  icon={
                    <BookOpenCheck className="h-5 w-5" aria-hidden="true" />
                  }
                />

                <SummaryCard
                  label="חזרות"
                  value={repeatAttempts}
                  sub="ניסיונות נוספים על שאלות שכבר נענו"
                  icon={<RotateCcw className="h-5 w-5" aria-hidden="true" />}
                />

                <SummaryCard
                  label="טעויות פתוחות"
                  value={overview.active_mistakes_count}
                  tone={
                    overview.active_mistakes_count > 0 ? "warning" : "default"
                  }
                  sub={`${overview.repeated_mistakes_count} טעויות שחזרו יותר מפעם אחת`}
                  icon={<XCircle className="h-5 w-5" aria-hidden="true" />}
                />

                <SummaryCard
                  label="משך ממוצע"
                  value={formatOptionalDuration(
                    overview.avg_session_duration_seconds,
                  )}
                  sub="למפגש שהושלם"
                  icon={<Activity className="h-5 w-5" aria-hidden="true" />}
                />
              </div>
            </section>

            <section className="space-y-3">
              <SectionHeader
                title="תובנות למיקוד"
                sub="מה הנתונים אומרים על המשך הלימוד"
              />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <InsightCard
                  icon={<Flame className="h-5 w-5" aria-hidden="true" />}
                  title="החלק לחיזוק"
                  value={focusPart ? PART_LABEL[focusPart] : "מאוזן"}
                  detail={
                    focusPart
                      ? `${PART_FULL_LABEL[focusPart]} נמוך יותר כרגע. כדאי לפתוח בו את התרגול הבא.`
                      : "שני החלקים קרובים זה לזה. אפשר להמשיך לפי סדר הבחינה."
                  }
                />

                <InsightCard
                  icon={<Trophy className="h-5 w-5" aria-hidden="true" />}
                  title="פער בין חלקים"
                  value={partGap === null ? "—" : `${partGap}%`}
                  detail={
                    strongPart
                      ? `${PART_LABEL[strongPart]} מוביל. שמור על הקצב, אבל אל תזניח את החלק השני.`
                      : "אין עדיין מספיק פער או נתונים כדי לזהות חוזקה ברורה."
                  }
                />

                <InsightCard
                  icon={<Clock3 className="h-5 w-5" aria-hidden="true" />}
                  title="ממוצע ציון"
                  value={
                    averageSessionScore === null
                      ? "—"
                      : `${averageSessionScore} נק׳`
                  }
                  detail={
                    sessions.length === 0
                      ? "יופיע אחרי השלמת מפגש ראשון."
                      : `מבוסס על ${sessions.length} מפגשים שהושלמו.`
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
                  genuineCorrect={overview.part_b.genuine_correct_answers}
                  invalidatedCredits={
                    overview.part_b.invalidated_credit_answers
                  }
                  incorrectAnswers={bIncorrect}
                  focus={focusPart === "B"}
                  strong={strongPart === "B"}
                />

                <PartProgressCard
                  part="C"
                  totalAnswered={overview.part_c.total_answered}
                  successRate={overview.part_c.success_rate}
                  genuineCorrect={overview.part_c.genuine_correct_answers}
                  invalidatedCredits={
                    overview.part_c.invalidated_credit_answers
                  }
                  incorrectAnswers={cIncorrect}
                  focus={focusPart === "C"}
                  strong={strongPart === "C"}
                />
              </div>
            </section>

            <section className="space-y-3">
              <SectionHeader
                title="אופי הלימוד"
                sub="כמה מפגשים הושלמו מכל סוג"
              />

              <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.2fr_0.8fr]">
                <ModeBreakdown sessions={sessions} />

                <div className="grid grid-cols-3 gap-2 lg:grid-cols-1">
                  <SummaryCard
                    label="תרגולים"
                    value={overview.practices_completed}
                    sub="מפגשי תרגול רגילים"
                  />
                  <SummaryCard
                    label="מבחני מועד"
                    value={overview.exams_completed}
                    sub="מועדים בודדים"
                  />
                  <SummaryCard
                    label="סימולציות"
                    value={overview.simulations_completed}
                    sub="מבחן מלא חלק ב׳ + ג׳"
                  />
                </div>
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
            <div className="overflow-hidden rounded-[var(--radius-xl)] border border-default bg-surface px-4 shadow-sm">
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
