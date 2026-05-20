import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ActionCard from "../components/ActionCard";
import Button from "../components/Button";
import Card from "../components/Card";
import PageLoading from "../components/PageLoading";
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

const formatPercent = (raw: number | string | null): string => {
  if (raw === null || raw === undefined) return "—";
  const n = typeof raw === "string" ? Number(raw) : raw;
  if (Number.isNaN(n)) return "—";
  return `${Math.round(n)}%`;
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

  if (status === "loading") return <PageLoading />;

  return (
    <div className="mx-auto w-full max-w-[720px] space-y-4 p-4 pb-28">
      <header className="rounded-[2rem] border border-[#e2d5c2] bg-[#fffaf1]/85 p-5 shadow-[0_16px_44px_rgba(79,31,64,0.08)]">
        <p className="text-sm font-medium text-[var(--accent)]">ברוך הבא</p>
        <h1 className="font-display mt-1 text-4xl font-black leading-tight text-[var(--accent-ink)]">
          תרגול בחינות לשכה
        </h1>
        <p className="mt-2 text-sm leading-6 text-stone-700">
          בחר מסלול, המשך סשן פעיל או חזור לשאלות שסימנת.
        </p>
        <Button
          fullWidth
          className="mt-5"
          onClick={() => navigate(ROUTES.practiceNew)}
        >
          התחל תרגול
        </Button>
      </header>

      {actionError && (
        <Card className="border-red-200 bg-red-50">
          <p className="text-sm text-red-700">{actionError}</p>
        </Card>
      )}

      {active && (
        <Card className="border-[var(--accent-soft)] bg-[#fff8fd]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-[var(--accent)]">
                המשך תרגול
              </p>
              <p className="font-semibold text-[var(--accent-ink)]">
                {modeLabel(active)}
              </p>
              <p className="mt-1 text-sm text-stone-600">
                {active.answered_count}/{active.total_questions} שאלות
              </p>
            </div>
            <Button onClick={() => navigate(resumePath(active))}>המשך</Button>
          </div>
        </Card>
      )}

      {sessionsUnavailable && (
        <Card className="border-amber-200 bg-amber-50">
          <p className="text-sm text-amber-800">
            לא ניתן לטעון תרגול פעיל כרגע.
          </p>
        </Card>
      )}

      <section className="grid grid-cols-2 gap-3">
        <ActionCard onClick={() => navigate(ROUTES.practiceNew)}>
          <p className="font-semibold text-[var(--accent-ink)]">תרגול חדש</p>
          <p className="mt-1 text-sm text-stone-600">חלק, מועד וכמות</p>
        </ActionCard>

        <ActionCard
          onClick={handleStartSimulation}
          disabled={startingSim}
        >
          <p className="font-semibold text-[var(--accent-ink)]">מבחן מלא</p>
          <p className="mt-1 text-sm text-stone-600">
            {startingSim ? "מתחיל…" : "סימולציה"}
          </p>
        </ActionCard>

        <ActionCard onClick={() => navigate(ROUTES.mistakes)}>
          <p className="font-semibold text-[var(--accent-ink)]">טעויות</p>
          <p className="mt-1 text-sm text-stone-600">
            {stats ? `${stats.active_mistakes_count} פתוחות` : "לחזרה"}
          </p>
        </ActionCard>

        <ActionCard onClick={() => navigate(ROUTES.bookmarks)}>
          <p className="font-semibold text-[var(--accent-ink)]">סימניות</p>
          <p className="mt-1 text-sm text-stone-600">
            {bookmarksUnavailable ? "לצפייה" : `${bookmarks.length} שמורות`}
          </p>
        </ActionCard>
      </section>

      {stats ? (
        <Card>
          <p className="mb-3 text-sm font-semibold text-[var(--accent-ink)]">
            מבט מהיר
          </p>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-stone-500">נענו</p>
              <p className="text-lg font-semibold text-[var(--accent-ink)]">
                {stats.total_answered}
              </p>
            </div>
            <div>
              <p className="text-stone-500">הצלחה</p>
              <p className="text-lg font-semibold text-[var(--accent-ink)]">
                {formatPercent(stats.overall_success_rate)}
              </p>
            </div>
            <div>
              <p className="text-stone-500">טעויות</p>
              <p className="text-lg font-semibold text-[var(--accent-ink)]">
                {stats.active_mistakes_count}
              </p>
            </div>
          </div>
        </Card>
      ) : (
        statsUnavailable && (
          <Card>
            <p className="text-sm text-stone-600">
              נתוני התקדמות לא זמינים כרגע.
            </p>
          </Card>
        )
      )}
    </div>
  );
};

export default HomePage;
