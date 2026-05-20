import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Button from "../components/Button";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import {
  createPracticeSession,
  createSimulationSession,
  getActiveSessions,
} from "../features/sessions/api";
import type { SessionSummary } from "../features/sessions/types";
import { getStatsOverview } from "../features/stats/api";
import type { StatsOverview } from "../features/stats/types";
import { getBookmarks } from "../features/bookmarks/api";
import type { BookmarkedQuestion } from "../features/bookmarks/types";

type Status = "loading" | "ready" | "error";

const NETWORK_ERR = "החיבור נכשל. נסה שוב";
const SIM_422 = "אין מספיק שאלות זמינות לסימולציה";
const PRACTICE_422 = "אין שאלות זמינות לתרגול הזה";

const ROUTES = {
  practiceNew: "/practice/new",
  practiceNewExam: "/practice/new?flow=exam",
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
      return "סימולציה כללית";
    case "exam":
      return `בחינת מועד${s.exam_date ? ` ${s.exam_date}` : ""}`;
    case "practice":
      if (s.part === "B") return "תרגול דין דיוני";
      if (s.part === "C") return "תרגול דין מהותי";
      return "תרגול חופשי";
    case "mistakes":
      return "טעויות פתוחות";
    case "bookmarks":
      return "סימניות שמורות";
    default:
      return "סשן פעיל";
  }
};

const HomePage = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("loading");
  const [active, setActive] = useState<SessionSummary | null>(null);
  const [stats, setStats] = useState<StatsOverview | null>(null);
  const [bookmarks, setBookmarks] = useState<BookmarkedQuestion[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getActiveSessions(), getStatsOverview(), getBookmarks()])
      .then(([sessions, overview, bm]) => {
        if (cancelled) return;
        setActive(sessions[0] ?? null);
        setStats(overview);
        setBookmarks(bm);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const retry = () => {
    setStatus("loading");
    setReloadKey((k) => k + 1);
  };

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

  if (status === "error") {
    return (
      <div className="mx-auto w-full max-w-[720px] p-4">
        <ErrorState
          message={NETWORK_ERR}
          action={<Button onClick={retry}>נסה שוב</Button>}
        />
      </div>
    );
  }

  const isFirstUse =
    !active && (!stats || stats.total_answered === 0) && bookmarks.length === 0;

  return (
    <div className="mx-auto w-full max-w-[720px] p-4 space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">בית</h1>
        <p className="text-sm text-gray-600">תרגול בחינות לשכת עורכי הדין</p>
      </header>

      {actionError && (
        <Card className="border-red-200 bg-red-50">
          <p className="text-sm text-red-700">{actionError}</p>
        </Card>
      )}

      {isFirstUse && (
        <EmptyState
          title="ברוך הבא"
          description="התחל בתרגול חופשי או בסימולציה כללית"
        />
      )}

      {active && (
        <Card className="border-blue-200 bg-blue-50">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-blue-700">סשן פעיל</p>
              <p className="font-semibold text-gray-900">{modeLabel(active)}</p>
              <p className="mt-1 text-sm text-gray-600">
                {active.answered_count}/{active.total_questions} שאלות
              </p>
            </div>
            <Button onClick={() => navigate(resumePath(active))}>המשך</Button>
          </div>
        </Card>
      )}

      <section className="grid gap-3">
        <Card
          role="button"
          tabIndex={0}
          onClick={handleStartSimulation}
          className="cursor-pointer"
          aria-disabled={busy === BUSY.sim}
        >
          <p className="font-semibold text-gray-900">סימולציה כללית</p>
          <p className="text-sm text-gray-600">בחינה מלאה בדרישות לשכה</p>
        </Card>

        <Card
          role="button"
          tabIndex={0}
          onClick={() => navigate(ROUTES.practiceNewExam)}
          className="cursor-pointer"
        >
          <p className="font-semibold text-gray-900">בחינת מועד</p>
          <p className="text-sm text-gray-600">תרגול לפי מועד היסטורי</p>
        </Card>

        <Card
          role="button"
          tabIndex={0}
          onClick={() => handleStartPractice("B")}
          className="cursor-pointer"
          aria-disabled={busy === BUSY.practiceB}
        >
          <p className="font-semibold text-gray-900">דין דיוני</p>
          <p className="text-sm text-gray-600">תרגול חלק ב'</p>
        </Card>

        <Card
          role="button"
          tabIndex={0}
          onClick={() => handleStartPractice("C")}
          className="cursor-pointer"
          aria-disabled={busy === BUSY.practiceC}
        >
          <p className="font-semibold text-gray-900">דין מהותי</p>
          <p className="text-sm text-gray-600">תרגול חלק ג'</p>
        </Card>

        <Card
          role="button"
          tabIndex={0}
          onClick={() => navigate(ROUTES.practiceNew)}
          className="cursor-pointer"
        >
          <p className="font-semibold text-gray-900">תרגול חופשי</p>
          <p className="text-sm text-gray-600">בחר נושאים ומספר שאלות</p>
        </Card>
      </section>

      <section className="grid gap-2">
        <Card
          role="button"
          tabIndex={0}
          onClick={() => navigate(ROUTES.mistakes)}
          className="cursor-pointer flex items-center justify-between"
        >
          <span className="font-medium text-gray-900">טעויות פתוחות</span>
          {stats && (
            <span className="text-sm text-gray-600">
              {stats.active_mistakes_count}
            </span>
          )}
        </Card>

        <Card
          role="button"
          tabIndex={0}
          onClick={() => navigate(ROUTES.bookmarks)}
          className="cursor-pointer flex items-center justify-between"
        >
          <span className="font-medium text-gray-900">סימניות שמורות</span>
          <span className="text-sm text-gray-600">{bookmarks.length}</span>
        </Card>
      </section>

      {stats && (
        <Card>
          <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
            <span className="text-gray-600">
              נענו: <b className="text-gray-900">{stats.total_answered}</b>
            </span>
            <span className="text-gray-600">
              הצלחה:{" "}
              <b className="text-gray-900">
                {formatPercent(stats.overall_success_rate)}
              </b>
            </span>
            <span className="text-gray-600">
              סימולציות:{" "}
              <b className="text-gray-900">{stats.simulations_completed}</b>
            </span>
          </div>
        </Card>
      )}
    </div>
  );
};

export default HomePage;
