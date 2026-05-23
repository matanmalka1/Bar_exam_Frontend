import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import StudyRoutesList from "../components/StudyRoutesList";
import { formatHebrewDate, greetingForHour } from "../dashboardFormat";

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
  const {
    status,
    active,
    stats,
    bookmarks,
    sessionsUnavailable,
    statsUnavailable,
    bookmarksUnavailable,
  } = useHomeOverview();
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

      <HomeStatsHero
        stats={stats}
        onStartPractice={() => navigate(ROUTES.practiceNew)}
      />

      {/* Active session strip */}
      {active && (
        <ActiveSessionCard
          session={active}
          onResume={() => navigate(resumePath(active))}
        />
      )}

      {sessionsUnavailable && (
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
    </div>
  );
};

export default HomePage;
