import { useState } from "react";
import type { ComponentType } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bookmark,
  CircleAlert,
  ClipboardList,
  PencilLine,
  Play,
} from "lucide-react";
import Button from "../components/Button";
import Card from "../components/Card";
import AppLoader from "../components/loader";
import { createSimulationSession } from "../features/sessions/api";
import type { SessionSummary } from "../features/sessions/types";
import { HTTP_UNPROCESSABLE, isApiStatusError } from "../lib/api";
import { useHomeOverview } from "./home/useHomeOverview";

const NETWORK_ERR = "החיבור נכשל. נסה שוב";
const SIM_422 = "אין מספיק שאלות זמינות למבחן";

const ROUTES = {
  practiceNew: "/practice/new",
  mistakes: "/mistakes",
  bookmarks: "/bookmarks",
  session: (id: number) => `/session/${id}`,
  exam: (id: number) => `/session/${id}/exam`,
} as const;

const HEBREW_WEEKDAYS = [
  "ראשון",
  "שני",
  "שלישי",
  "רביעי",
  "חמישי",
  "שישי",
  "שבת",
];

const HEBREW_MONTHS = [
  "ינואר",
  "פברואר",
  "מרץ",
  "אפריל",
  "מאי",
  "יוני",
  "יולי",
  "אוגוסט",
  "ספטמבר",
  "אוקטובר",
  "נובמבר",
  "דצמבר",
];

const formatHebrewDate = (d: Date) =>
  `יום ${HEBREW_WEEKDAYS[d.getDay()]}, ${d.getDate()} ב${HEBREW_MONTHS[d.getMonth()]}`;

const greetingForHour = (h: number): string => {
  if (h < 5) return "לילה טוב";
  if (h < 12) return "בוקר טוב";
  if (h < 17) return "צהריים טובים";
  if (h < 21) return "ערב טוב";
  return "לילה טוב";
};

const resumePath = (s: SessionSummary): string =>
  s.mode === "exam" || s.mode === "simulation"
    ? ROUTES.exam(s.id)
    : ROUTES.session(s.id);

const toNumber = (raw: number | string | null | undefined): number | null => {
  if (raw === null || raw === undefined) return null;
  const n = typeof raw === "string" ? Number(raw) : raw;
  return Number.isNaN(n) ? null : n;
};

const formatPercent = (raw: number | string | null | undefined): string => {
  const n = toNumber(raw);
  return n === null ? "—" : `${Math.round(n)}%`;
};

const modeLabel = (s: SessionSummary): string => {
  switch (s.mode) {
    case "simulation":
      return "מבחן מלא";
    case "exam":
      return `בחינת מועד${s.exam_date ? ` ${s.exam_date}` : ""}`;
    case "practice":
      if (s.part === "B") return "דין דיוני";
      if (s.part === "C") return "דין מהותי";
      return "תרגול";
    case "mistakes":
      return "חזרה על טעויות";
    case "bookmarks":
      return "חזרה על סימניות";
    default:
      return "תרגול";
  }
};

interface RouteRowProps {
  index: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  hint: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const RouteRow = ({
  index,
  icon: Icon,
  title,
  hint,
  onClick,
  disabled,
  loading,
}: RouteRowProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="focus-ring group flex w-full items-center gap-4 py-4 text-right transition disabled:cursor-not-allowed disabled:opacity-45"
  >
    <span className="font-display w-7 shrink-0 text-xs tabular-nums text-secondary opacity-60">
      {index}
    </span>
    <span className="surface inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-default transition group-hover:border-strong group-active:scale-95">
      <Icon className="h-5 w-5" strokeWidth={1.8} />
    </span>
    <span className="min-w-0 flex-1">
      <span className="font-display block text-lg font-bold leading-tight text-[var(--accent-ink)]">
        {title}
      </span>
      <span className="mt-0.5 block truncate text-sm text-secondary">
        {loading ? <AppLoader variant="inline" label="מתחיל..." /> : hint}
      </span>
    </span>
    <ArrowLeft
      className="h-5 w-5 shrink-0 text-secondary transition group-hover:-translate-x-1 group-hover:text-primary"
      aria-hidden="true"
    />
  </button>
);

interface PartCellProps {
  label: string;
  answered: number;
  rate: number | null;
}

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

const HomePage = () => {
  const navigate = useNavigate();
  const {
    status,
    active,
    stats,
    bookmarks,
    sessionsUnavailable,
    statsUnavailable,
    bookmarksUnavailable,
  } = useHomeOverview();
  const [actionError, setActionError] = useState<string | null>(null);
  const [startingSim, setStartingSim] = useState(false);

  const handleStartSimulation = async () => {
    setActionError(null);
    setStartingSim(true);
    try {
      const s = await createSimulationSession();
      navigate(ROUTES.exam(s.id));
    } catch (err) {
      setActionError(
        isApiStatusError(err, HTTP_UNPROCESSABLE) ? SIM_422 : NETWORK_ERR,
      );
    } finally {
      setStartingSim(false);
    }
  };

  if (status === "loading") {
    return <AppLoader variant="page" label="טוען נתונים..." />;
  }

  const now = new Date();
  const activeProgress =
    active && active.total_questions > 0
      ? (active.answered_count / active.total_questions) * 100
      : 0;

  const successRateNum = stats ? toNumber(stats.overall_success_rate) : null;
  const successRateDisplay =
    successRateNum === null ? "—" : Math.round(successRateNum);

  const mistakesCount = stats?.active_mistakes_count ?? 0;
  const simulationsDone = stats?.simulations_completed ?? 0;
  const answeredCount = stats?.total_answered ?? null;

  const mistakesHint = statsUnavailable
    ? "לחזרה ולשיפור"
    : mistakesCount === 0
      ? "אין טעויות פתוחות לתרגול"
      : `${mistakesCount} שאלות פתוחות לתרגול`;

  const bookmarksHint = bookmarksUnavailable
    ? "לצפייה בסימניות שמורות"
    : bookmarks.length === 0
      ? "אין סימניות שמורות"
      : `${bookmarks.length} סימניות שמורות`;

  return (
    <div className="mx-auto w-full max-w-[560px] px-5 pb-10 pt-6">
      {/* Top meta strip */}
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] uppercase tracking-[0.22em] text-secondary">
          {formatHebrewDate(now)}
        </span>
        <span className="font-display text-xs text-secondary">
          לשכת עוה״ד · תרגול
        </span>
      </div>

      {/* Greeting */}
      <h1 className="font-display mt-4 text-[2.5rem] font-black leading-[1.02] text-[var(--accent-ink)]">
        {greetingForHour(now.getHours())}
      </h1>
      <p className="mt-1 text-sm text-secondary">
        מוכנים להמשיך לעבוד לקראת הבחינה ?
      </p>

      {/* Hero metric */}
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
              {answeredCount ?? "—"}
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
          <span className="tabular-nums">{mistakesCount} טעויות פתוחות</span>
          <span className="tabular-nums">
            {simulationsDone} סימולציות הושלמו
          </span>
        </div>
      </section>

      {/* Active session strip */}
      {active && (
        <button
          type="button"
          onClick={() => navigate(resumePath(active))}
          className="focus-ring group mt-7 block w-full overflow-hidden rounded-2xl bg-[var(--accent-ink)] p-4 text-right text-white shadow-[var(--shadow-elevated)] transition active:scale-[0.99]"
        >
          <div className="flex items-center gap-4">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25 transition group-hover:bg-white/25">
              <Play className="h-5 w-5" fill="currentColor" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/70">
                המשך תרגול פעיל
              </p>
              <p className="font-display mt-0.5 truncate text-lg font-bold leading-tight">
                {modeLabel(active)}
              </p>
              <p className="mt-1 text-xs tabular-nums text-white/70">
                {active.answered_count}/{active.total_questions} שאלות
              </p>
            </div>
            <ArrowLeft
              className="h-5 w-5 shrink-0 text-white/70 transition group-hover:-translate-x-1 group-hover:text-white"
              aria-hidden="true"
            />
          </div>
          <div className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-white transition-all duration-500"
              style={{ width: `${activeProgress}%` }}
            />
          </div>
        </button>
      )}

      {actionError && (
        <Card className="mt-5 border-2 border-strong">
          <p className="text-sm font-semibold text-primary">{actionError}</p>
        </Card>
      )}

      {sessionsUnavailable && !actionError && (
        <p className="mt-5 text-xs text-secondary">
          לא ניתן לטעון תרגול פעיל כרגע.
        </p>
      )}

      {/* Primary CTAs */}
      <div className="mt-7 flex gap-2">
        <Button fullWidth onClick={() => navigate(ROUTES.practiceNew)}>
          התחל תרגול
        </Button>
        <Button
          variant="secondary"
          onClick={handleStartSimulation}
          disabled={startingSim}
          className="shrink-0 px-5"
        >
          {startingSim ? (
            <AppLoader variant="button" label="מתחיל" />
          ) : (
            "מבחן מלא"
          )}
        </Button>
      </div>

      {/* Routes list */}
      <section className="mt-9">
        <div className="flex items-baseline justify-between border-b border-default pb-2">
          <h2 className="font-display text-base font-bold text-[var(--accent-ink)]">
            מסלולי לימוד
          </h2>
          <span className="text-[10px] uppercase tracking-[0.22em] text-secondary">
            בחר כיוון
          </span>
        </div>

        <ul className="divide-y divide-black/10">
          <li>
            <RouteRow
              index="01"
              icon={PencilLine}
              title="תרגול חדש"
              hint="בחר חלק, מועד וכמות שאלות"
              onClick={() => navigate(ROUTES.practiceNew)}
            />
          </li>
          <li>
            <RouteRow
              index="02"
              icon={ClipboardList}
              title="סימולציית מבחן מלא"
              hint="התחל מבחן בתנאי בחינה"
              onClick={handleStartSimulation}
              disabled={startingSim}
              loading={startingSim}
            />
          </li>
          <li>
            <RouteRow
              index="03"
              icon={CircleAlert}
              title="חזרה על טעויות"
              hint={mistakesHint}
              onClick={() => navigate(ROUTES.mistakes)}
            />
          </li>
          <li>
            <RouteRow
              index="04"
              icon={Bookmark}
              title="שאלות שסומנו"
              hint={bookmarksHint}
              onClick={() => navigate(ROUTES.bookmarks)}
            />
          </li>
        </ul>
      </section>

      {/* Part breakdown */}
      {stats ? (
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
      ) : (
        statsUnavailable && (
          <p className="mt-9 text-center text-xs text-secondary">
            נתוני התקדמות לא זמינים כרגע.
          </p>
        )
      )}
    </div>
  );
};

export default HomePage;
