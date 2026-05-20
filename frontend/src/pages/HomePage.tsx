import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Button from "../components/Button";
import Card from "../components/Card";
import {
  createPracticeSession,
  createSimulationSession,
  listUserSessions,
} from "../features/sessions/api";
import type { SessionSummary } from "../features/sessions/types";
import { getStatsOverview } from "../features/stats/api";
import type { StatsOverview } from "../features/stats/types";
import { getBookmarks } from "../features/bookmarks/api";
import type { BookmarkedQuestion } from "../features/bookmarks/types";

type Status = "loading" | "ready";

const NETWORK_ERR = "החיבור נכשל. נסה שוב";
const SIM_422 = "אין מספיק שאלות זמינות למבחן";
const PRACTICE_422 = "אין שאלות זמינות לתרגול הזה";

const ROUTES = {
  practiceNew: "/practice/new",
  mistakes: "/mistakes",
  bookmarks: "/bookmarks",
  session: (id: number) => `/session/${id}`,
  exam: (id: number) => `/session/${id}/exam`,
} as const;

const BUSY = {
  sim: "sim",
  practiceB: "practice-B",
  practiceC: "practice-C",
} as const;

const HTTP_UNPROCESSABLE = 422;

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
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [active, setActive] = useState<SessionSummary | null>(null);
  const [stats, setStats] = useState<StatsOverview | null>(null);
  const [statsUnavailable, setStatsUnavailable] = useState(false);
  const [bookmarks, setBookmarks] = useState<BookmarkedQuestion[]>([]);
  const [bookmarksUnavailable, setBookmarksUnavailable] = useState(false);
  const [sessionsUnavailable, setSessionsUnavailable] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([
      listUserSessions(),
      getStatsOverview(),
      getBookmarks(),
    ]).then(([sessionsResult, statsResult, bookmarksResult]) => {
      if (cancelled) return;

      if (sessionsResult.status === "fulfilled") {
        setSessions(sessionsResult.value);
        setActive(latestActiveSession(sessionsResult.value));
        setSessionsUnavailable(false);
      } else {
        setSessions([]);
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
    setBusy(BUSY.sim);
    try {
      const s = await createSimulationSession();
      navigate(ROUTES.exam(s.id));
    } catch (err) {
      if (
        axios.isAxiosError(err) &&
        err.response?.status === HTTP_UNPROCESSABLE
      ) {
        setActionError(SIM_422);
      } else {
        setActionError(NETWORK_ERR);
      }
    } finally {
      setBusy(null);
    }
  };

  const handleStartPractice = async (part: "B" | "C") => {
    setActionError(null);
    setBusy(part === "B" ? BUSY.practiceB : BUSY.practiceC);
    try {
      const s = await createPracticeSession({ part });
      navigate(ROUTES.session(s.id));
    } catch (err) {
      if (
        axios.isAxiosError(err) &&
        err.response?.status === HTTP_UNPROCESSABLE
      ) {
        setActionError(PRACTICE_422);
      } else {
        setActionError(NETWORK_ERR);
      }
    } finally {
      setBusy(null);
    }
  };

  if (status === "loading") {
    return (
      <div className="mx-auto w-full max-w-[720px] p-4">
        <p className="text-gray-600">טוען…</p>
      </div>
    );
  }

  const answered = stats?.total_answered ?? 0;
  const hasStarted = Boolean(active) || answered > 0 || bookmarks.length > 0;

  return (
    <div className="mx-auto w-full max-w-[720px] p-4 pb-28 space-y-4">
      <header className="space-y-1">
        <p className="text-sm text-gray-600">ברוך הבא</p>
        <h1 className="text-2xl font-bold text-gray-900">
          תרגול בחינות לשכה
        </h1>
      </header>

      {actionError && (
        <Card className="border-red-200 bg-red-50">
          <p className="text-sm text-red-700">{actionError}</p>
        </Card>
      )}

      {active && (
        <Card className="border-blue-200 bg-blue-50">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-blue-700">המשך תרגול</p>
              <p className="font-semibold text-gray-900">{modeLabel(active)}</p>
              <p className="mt-1 text-sm text-gray-600">
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

      <Button fullWidth onClick={() => navigate(ROUTES.practiceNew)}>
        התחל תרגול
      </Button>

      {!hasStarted && !statsUnavailable && (
        <Card>
          <p className="font-semibold text-gray-900">מוכן להתחיל?</p>
          <p className="mt-1 text-sm text-gray-600">
            בחר תרגול קצר או מבחן מלא.
          </p>
        </Card>
      )}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card
          role="button"
          tabIndex={0}
          onClick={() => navigate(ROUTES.mistakes)}
          className="cursor-pointer"
        >
          <p className="font-semibold text-gray-900">טעויות</p>
          <p className="mt-1 text-sm text-gray-600">
            {stats ? `${stats.active_mistakes_count} פתוחות` : "לחזרה"}
          </p>
        </Card>

        <Card
          role="button"
          tabIndex={0}
          onClick={() => navigate(ROUTES.bookmarks)}
          className="cursor-pointer"
        >
          <p className="font-semibold text-gray-900">סימניות</p>
          <p className="mt-1 text-sm text-gray-600">
            {bookmarksUnavailable ? "לצפייה" : `${bookmarks.length} שמורות`}
          </p>
        </Card>

        <Card
          role="button"
          tabIndex={0}
          onClick={handleStartSimulation}
          className="cursor-pointer"
          aria-disabled={busy === BUSY.sim}
        >
          <p className="font-semibold text-gray-900">מבחן מלא</p>
          <p className="mt-1 text-sm text-gray-600">
            {busy === BUSY.sim ? "מתחיל…" : "סימולציה"}
          </p>
        </Card>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <Card
          role="button"
          tabIndex={0}
          onClick={() => handleStartPractice("B")}
          className="cursor-pointer"
          aria-disabled={busy === BUSY.practiceB}
        >
          <p className="font-semibold text-gray-900">דין דיוני</p>
          <p className="mt-1 text-sm text-gray-600">
            {busy === BUSY.practiceB ? "מתחיל…" : "חלק ב׳"}
          </p>
        </Card>

        <Card
          role="button"
          tabIndex={0}
          onClick={() => handleStartPractice("C")}
          className="cursor-pointer"
          aria-disabled={busy === BUSY.practiceC}
        >
          <p className="font-semibold text-gray-900">דין מהותי</p>
          <p className="mt-1 text-sm text-gray-600">
            {busy === BUSY.practiceC ? "מתחיל…" : "חלק ג׳"}
          </p>
        </Card>
      </section>

      {stats ? (
        <Card>
          <p className="mb-3 text-sm font-semibold text-gray-900">מבט מהיר</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500">סשנים</p>
              <p className="text-lg font-semibold text-gray-900">
                {sessions.length}
              </p>
            </div>
            <div>
              <p className="text-gray-500">מבחנים</p>
              <p className="text-lg font-semibold text-gray-900">
                {stats.simulations_completed}
              </p>
            </div>
            <div>
              <p className="text-gray-500">הצלחה</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatPercent(stats.overall_success_rate)}
              </p>
            </div>
            <div>
              <p className="text-gray-500">סימניות</p>
              <p className="text-lg font-semibold text-gray-900">
                {bookmarksUnavailable ? "—" : bookmarks.length}
              </p>
            </div>
            <div>
              <p className="text-gray-500">טעויות</p>
              <p className="text-lg font-semibold text-gray-900">
                {stats.active_mistakes_count}
              </p>
            </div>
          </div>
        </Card>
      ) : (
        statsUnavailable && (
          <Card>
            <p className="text-sm text-gray-600">
              נתוני התקדמות לא זמינים כרגע.
            </p>
          </Card>
        )
      )}
    </div>
  );
};

export default HomePage;
