import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import Button from "../../../components/Button";
import AppLoader from "../../../components/loader";
import { createSimulationSession } from "../../sessions/api";
import type { SessionSummary } from "../../sessions/types";
import { HTTP_UNPROCESSABLE, isApiStatusError } from "../../../lib/api";
import { useHomeOverview } from "../hooks/useHomeOverview";
import { notifyError } from "../../../lib/toast";
import ActiveSessionCard from "../components/ActiveSessionCard";
import HomeStatsHero from "../components/HomeStatsHero";
import PartBreakdown from "../components/PartBreakdown";
import SimulationHistoryCard from "../components/SimulationHistoryCard";
import StudyRoutesList from "../components/StudyRoutesList";
import { formatHebrewDate, greetingForHour } from "../dashboardFormat";
import { useSimulationHistory } from "../hooks/useSimulationHistory";

const NETWORK_ERR = "החיבור נכשל. נסה שוב";
const SIM_422 = "אין מספיק שאלות זמינות למבחן";

const ROUTES = {
  practiceNew: "/practice/new",
  mistakes: "/mistakes",
  bookmarks: "/bookmarks",
  session: (id: number) => `/session/${id}`,
  exam: (id: number) => `/session/${id}/exam`,
} as const;

const resumePath = (s: SessionSummary): string =>
  s.mode === "exam" || s.mode === "simulation"
    ? ROUTES.exam(s.id)
    : ROUTES.session(s.id);

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    status,
    activeSessions,
    stats,
    bookmarks,
    sessionsUnavailable,
    statsUnavailable,
    bookmarksUnavailable,
  } = useHomeOverview();
  const { simulations } = useSimulationHistory();
  const [startingSim, setStartingSim] = useState(false);

  const handleStartSimulation = async () => {
    setStartingSim(true);
    try {
      const s = await createSimulationSession();
      navigate(ROUTES.exam(s.id));
    } catch (err) {
      notifyError(
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
  const mistakesCount = stats?.active_mistakes_count ?? 0;
  const totalAnswered = stats?.total_answered ?? 0;

  const tagline =
    !stats || totalAnswered === 0
      ? "בחר חלק וצא לדרך."
      : mistakesCount > 0
        ? `יש לך ${mistakesCount} טעויות פתוחות לחזרה.`
        : "כל הכבוד — אין טעויות פתוחות.";

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
    <div className="mx-auto w-full max-w-2xl px-4 pb-12 pt-6 sm:px-6">
      <section className="rounded-[2rem] border border-default bg-surface px-5 py-6 shadow-sm sm:px-8 sm:py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-[0.22em] text-secondary">
              {formatHebrewDate(now)}
            </span>

            <h1 className="font-display mt-4 leading-tight text-[var(--accent-ink)]">
              <span className="block text-[2.75rem] font-black leading-none sm:text-[2rem]">
                {greetingForHour(now.getHours())}
              </span>
              {user?.full_name && (
                <span className="block text-[1.6rem] font-bold sm:text-[1.5rem]">
                  {user.full_name}
                </span>
              )}
            </h1>

            <p className="mt-3 max-w-md text-sm leading-6 text-secondary">
              {tagline}
            </p>
          </div>
        </div>

        <div className="mt-7">
          <HomeStatsHero
            stats={stats}
            onStartPractice={() => navigate(ROUTES.practiceNew)}
            onOpenMistakes={() => navigate(ROUTES.mistakes)}
          />
        </div>

        <div className="mt-7 flex flex-col gap-2 sm:flex-row">
          <Button fullWidth onClick={() => navigate(ROUTES.practiceNew)}>
            התחל תרגול
          </Button>

          <Button
            variant="secondary"
            onClick={handleStartSimulation}
            disabled={startingSim}
            className="sm:w-auto sm:min-w-[140px]"
          >
            {startingSim ? (
              <AppLoader variant="button" label="מתחיל" />
            ) : (
              "מבחן מלא"
            )}
          </Button>
        </div>
      </section>

      {activeSessions.length > 0 && (
        <div className="mt-5">
          <ActiveSessionCard
            session={activeSessions[0]}
            onResume={() => navigate(resumePath(activeSessions[0]))}
          />
          {activeSessions.length > 1 && (
            <button
              type="button"
              onClick={() => navigate("/sessions/active")}
              className="mt-2 w-full text-center text-xs text-secondary underline underline-offset-2"
            >
              ועוד {activeSessions.length - 1} תרגולים פתוחים
            </button>
          )}
        </div>
      )}

      {sessionsUnavailable && (
        <p className="mt-4 rounded-2xl border border-default bg-surface-muted px-4 py-3 text-xs text-secondary">
          לא ניתן לטעון תרגול פעיל כרגע.
        </p>
      )}

      <StudyRoutesList
        mistakesHint={mistakesHint}
        bookmarksHint={bookmarksHint}
        startingSimulation={startingSim}
        onStartPractice={() => navigate(ROUTES.practiceNew)}
        onStartSimulation={handleStartSimulation}
        onOpenMistakes={() => navigate(ROUTES.mistakes)}
        onOpenBookmarks={() => navigate(ROUTES.bookmarks)}
      />

      <PartBreakdown stats={stats} statsUnavailable={statsUnavailable} />

      <SimulationHistoryCard simulations={simulations} />
    </div>
  );
};

export default HomePage;
