import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import Button from "../components/Button";
import Card from "../components/Card";
import AppLoader from "../components/loader";
import {
  createSimulationSession,
  listUserSessions,
} from "../features/sessions/api";
import type { SessionSummary } from "../features/sessions/types";
import { getStatsOverview } from "../features/stats/api";
import type { StatsOverview } from "../features/stats/types";
import { getBookmarks } from "../features/bookmarks/api";
import type { BookmarkedQuestion } from "../features/bookmarks/types";
import { HTTP_UNPROCESSABLE, isApiStatusError } from "../lib/api";
import { cn } from "../lib/cn";

type Status = "loading" | "ready";

const NETWORK_ERR = "החיבור נכשל. נסה שוב";
const SIM_422 = "אין מספיק שאלות זמינות למבחן";

const ROUTES = {
  practiceNew: "/practice/new",
  mistakes: "/mistakes",
  bookmarks: "/bookmarks",
  session: (id: number) => `/session/${id}`,
  exam: (id: number) => `/session/${id}/exam`,
} as const;

const resumePath = (s: SessionSummary) =>
  s.mode === "exam" || s.mode === "simulation"
    ? ROUTES.exam(s.id)
    : ROUTES.session(s.id);

const toNumber = (raw: number | string | null | undefined): number | null => {
  if (raw === null || raw === undefined) return null;
  const n = typeof raw === "string" ? Number(raw) : raw;
  return Number.isNaN(n) ? null : n;
};

const formatPercent = (raw: number | string | null): string => {
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
      return "טעויות";
    case "bookmarks":
      return "סימניות";
    default:
      return "תרגול";
  }
};

const latestActiveSession = (sessions: SessionSummary[]) =>
  sessions.find((session) => session.status === "active") ?? null;

const Icon = ({ children }: { children: ReactNode }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const IconPlay = () => (
  <Icon>
    <path d="M7 5v14l12-7z" />
  </Icon>
);
const IconExam = () => (
  <Icon>
    <path d="M5 4h11l3 3v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
    <path d="M8 11h8M8 15h5M8 7h5" />
  </Icon>
);
const IconMistakes = () => (
  <Icon>
    <path d="M12 9v4M12 17h.01" />
    <path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.4 0Z" />
  </Icon>
);
const IconBookmark = () => (
  <Icon>
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </Icon>
);
const IconArrow = () => (
  <Icon>
    <path d="M15 6l-6 6 6 6" />
  </Icon>
);

interface TileProps {
  onClick?: () => void;
  disabled?: boolean;
  icon: ReactNode;
  title: string;
  sub: ReactNode;
  tone: "primary" | "plain" | "muted" | "strong";
}

const TONE: Record<TileProps["tone"], string> = {
  primary: "surface-muted text-primary ring-black/10",
  plain: "surface text-primary ring-black/20",
  muted: "surface-muted text-primary ring-black/20",
  strong: "surface text-primary ring-black/30",
};

const Tile = ({ onClick, disabled, icon, title, sub, tone }: TileProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "focus-ring group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-default p-4 text-right shadow-[var(--shadow-default)] ring-1 transition active:scale-[0.98] hover:shadow-[var(--shadow-elevated)] disabled:cursor-not-allowed disabled:opacity-45",
      TONE[tone],
    )}
  >
    <div className="flex items-start justify-between">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/70 shadow-sm">
        {icon}
      </span>
      <span className="opacity-50 transition group-hover:opacity-100">
        <IconArrow />
      </span>
    </div>
    <div className="mt-6">
      <p className="font-display text-xl font-bold leading-tight">{title}</p>
      <p className="mt-1 text-sm opacity-80">{sub}</p>
    </div>
  </button>
);

const Progress = ({ value }: { value: number }) => (
  <div className="h-2 w-full overflow-hidden rounded-full bg-white/70">
    <div
      className="h-full rounded-full bg-black transition-all"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

const StatBlock = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <div className="rounded-2xl border border-default bg-white/70 px-3 py-3 text-center">
    <p className="text-[11px] font-medium uppercase tracking-wide text-secondary">
      {label}
    </p>
    <p className="font-display mt-1 text-2xl font-black text-[var(--accent-ink)]">
      {value}
    </p>
  </div>
);

const HomePage = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("loading");
  const [active, setActive] = useState<SessionSummary | null>(null);
  const [stats, setStats] = useState<StatsOverview | null>(null);
  const [statsUnavailable, setStatsUnavailable] = useState(false);
  const [bookmarks, setBookmarks] = useState<BookmarkedQuestion[]>([]);
  const [bookmarksUnavailable, setBookmarksUnavailable] = useState(false);
  const [sessionsUnavailable, setSessionsUnavailable] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [startingSim, setStartingSim] = useState(false);

  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([
      listUserSessions(),
      getStatsOverview(),
      getBookmarks(),
    ]).then(([sessionsResult, statsResult, bookmarksResult]) => {
      if (cancelled) return;

      if (sessionsResult.status === "fulfilled") {
        setActive(latestActiveSession(sessionsResult.value));
        setSessionsUnavailable(false);
      } else {
        setActive(null);
        setSessionsUnavailable(true);
      }

      if (statsResult.status === "fulfilled") {
        setStats(statsResult.value);
        setStatsUnavailable(false);
      } else {
        setStats(null);
        setStatsUnavailable(true);
      }

      if (bookmarksResult.status === "fulfilled") {
        setBookmarks(bookmarksResult.value);
        setBookmarksUnavailable(false);
      } else {
        setBookmarks([]);
        setBookmarksUnavailable(true);
      }

      setStatus("ready");
    });

    return () => {
      cancelled = true;
    };
  }, []);

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

  const activeProgress = active
    ? active.total_questions > 0
      ? (active.answered_count / active.total_questions) * 100
      : 0
    : 0;

  const successRate = stats ? toNumber(stats.overall_success_rate) : null;

  return (
    <div className="mx-auto w-full max-w-[720px] space-y-5 p-4">
      <header className="surface-muted relative overflow-hidden rounded-[2rem] border border-default p-6 shadow-[var(--shadow-elevated)]">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-[var(--accent-soft)] opacity-50 blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -right-10 h-56 w-56 rounded-full bg-white opacity-45 blur-3xl"
        />
        <div className="relative">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-[var(--accent)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            ברוך הבא
          </p>
          <h1 className="font-display mt-3 text-[2.6rem] font-black leading-[1.05] text-[var(--accent-ink)]">
            תרגול בחינות
            <br />
            לשכת עורכי הדין
          </h1>
          <p className="mt-3 max-w-[26ch] text-sm leading-6 text-secondary">
            בחר מסלול, המשך סשן פעיל או חזור לשאלות שסימנת.
          </p>
          <Button
            fullWidth
            className="mt-5 shadow-lg shadow-black/10"
            onClick={() => navigate(ROUTES.practiceNew)}
          >
            התחל תרגול
          </Button>
        </div>
      </header>

      {actionError && (
        <Card className="border-2 border-strong bg-white">
          <p className="text-sm text-primary font-semibold">{actionError}</p>
        </Card>
      )}

      {active && (
        <button
          type="button"
          onClick={() => navigate(resumePath(active))}
          className="focus-ring surface-muted group relative w-full overflow-hidden rounded-3xl border border-default p-5 text-right shadow-[var(--shadow-default)] transition hover:shadow-[var(--shadow-elevated)]"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--accent)]">
                המשך תרגול
              </p>
              <p className="font-display mt-1 text-xl font-bold text-[var(--accent-ink)]">
                {modeLabel(active)}
              </p>
              <p className="mt-1 text-sm text-secondary">
                {active.answered_count}/{active.total_questions} שאלות
              </p>
            </div>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent)] text-white shadow-md transition group-hover:bg-[var(--accent-ink)]">
              <IconPlay />
            </span>
          </div>
          <div className="mt-4">
            <Progress value={activeProgress} />
          </div>
        </button>
      )}

      {sessionsUnavailable && (
        <Card className="border-strong bg-[var(--surface-muted)]">
          <p className="text-sm text-primary">לא ניתן לטעון תרגול פעיל כרגע.</p>
        </Card>
      )}

      <section>
        <div className="mb-2 flex items-baseline justify-between px-1">
          <h2 className="font-display text-lg font-bold text-[var(--accent-ink)]">
            מסלולים
          </h2>
          <span className="text-xs text-secondary">בחר כיוון</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Tile
            tone="primary"
            icon={<IconPlay />}
            title="תרגול חדש"
            sub="חלק, מועד וכמות"
            onClick={() => navigate(ROUTES.practiceNew)}
          />
          <Tile
            tone="plain"
            icon={<IconExam />}
            title="מבחן מלא"
            sub={
              startingSim ? (
                <AppLoader variant="inline" label="מתחיל..." />
              ) : (
                "סימולציה"
              )
            }
            onClick={handleStartSimulation}
            disabled={startingSim}
          />
          <Tile
            tone="strong"
            icon={<IconMistakes />}
            title="טעויות"
            sub={stats ? `${stats.active_mistakes_count} פתוחות` : "לחזרה"}
            onClick={() => navigate(ROUTES.mistakes)}
          />
          <Tile
            tone="muted"
            icon={<IconBookmark />}
            title="סימניות"
            sub={bookmarksUnavailable ? "לצפייה" : `${bookmarks.length} שמורות`}
            onClick={() => navigate(ROUTES.bookmarks)}
          />
        </div>
      </section>

      {stats ? (
        <section className="surface-muted rounded-3xl border border-default p-5 shadow-[var(--shadow-default)]">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-display text-lg font-bold text-[var(--accent-ink)]">
              מבט מהיר
            </h2>
            <span className="text-xs text-secondary">סטטיסטיקה</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <StatBlock label="נענו" value={stats.total_answered} />
            <StatBlock
              label="הצלחה"
              value={formatPercent(stats.overall_success_rate)}
            />
            <StatBlock label="טעויות" value={stats.active_mistakes_count} />
          </div>
          {successRate !== null && (
            <div className="mt-4">
              <div className="mb-1 flex items-center justify-between text-xs text-secondary">
                <span>אחוז הצלחה כולל</span>
                <span>{Math.round(successRate)}%</span>
              </div>
              <Progress value={successRate} />
            </div>
          )}
        </section>
      ) : (
        statsUnavailable && (
          <Card>
            <p className="text-sm text-secondary">
              נתוני התקדמות לא זמינים כרגע.
            </p>
          </Card>
        )
      )}
    </div>
  );
};

export default HomePage;
