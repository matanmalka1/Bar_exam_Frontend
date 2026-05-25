import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CircleAlert } from "lucide-react";
import { useAuth } from "../../auth/useAuth";
import Button from "../../../components/Button";
import AppLoader from "../../../components/loader";
import { createSimulationSession } from "../../sessions/api";
import type { SessionSummary } from "../../sessions/types";
import { isExamLike } from "../../sessions/types";
import { HTTP_UNPROCESSABLE, isApiStatusError } from "../../../lib/api";
import { useHomeOverview } from "../hooks/useHomeOverview";
import { notifyError } from "../../../lib/toast";
import ActiveSessionCard from "../components/ActiveSessionCard";
import SimulationHistoryCard from "../components/SimulationHistoryCard";
import StudyRoutesList from "../components/StudyRoutesList";
import {
  formatHebrewDate,
  formatPercent,
  greetingForHour,
} from "../dashboardFormat";
import { useSimulationHistory } from "../hooks/useSimulationHistory";
import type { StatsOverview } from "../../stats/types";
import { formatStudyTime } from "../../../lib/time-format";
import { computeStreak } from "../computeStreak";
import StreakCard from "../components/StreakCard";

const NETWORK_ERR = "החיבור נכשל. נסה שוב";
const SIM_422 = "אין מספיק שאלות זמינות למבחן";

const ROUTES = {
  practiceNew: "/practice/new",
  mistakes: "/mistakes",
  bookmarks: "/bookmarks",
  questions: "/questions",
  session: (id: number) => `/session/${id}`,
  exam: (id: number) => `/session/${id}/exam`,
} as const;

const resumePath = (s: SessionSummary): string =>
  isExamLike(s.mode) ? ROUTES.exam(s.id) : ROUTES.session(s.id);

// ─── Sub-components ───────────────────────────────────────────────────────────

const PartSuccessBar = ({
  label,
  rate,
  answered,
}: {
  label: string;
  rate: number | null;
  answered: number;
}) => (
  <div>
    <div className="mb-1.5 flex items-baseline justify-between">
      <span className="text-[13px] font-semibold text-primary">{label}</span>
      <span className="font-display tabular-nums text-lg font-black text-[var(--accent-ink)] leading-none">
        {formatPercent(rate)}
      </span>
    </div>
    <div className="h-1.5 overflow-hidden rounded-full bg-[var(--border-subtle)]">
      <div
        className="h-full rounded-full bg-[var(--ink)] transition-all duration-500"
        style={{ width: `${Math.round(rate ?? 0)}%` }}
      />
    </div>
    <p className="mt-1 tabular-nums text-[11px] text-[var(--text-tertiary)]">
      {answered} שאלות נענו
    </p>
  </div>
);

const SessionCountChip = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-[20px] border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3.5 py-3 text-center">
    <div className="font-display tabular-nums text-2xl font-black leading-none text-[var(--accent-ink)]">
      {value}
    </div>
    <div className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-secondary">
      {label}
    </div>
  </div>
);

const HomeProgressCard = ({
  stats,
  mistakesCount,
  onMistakesClick,
}: {
  stats: StatsOverview;
  mistakesCount: number;
  onMistakesClick: () => void;
}) => {
  const correctAnswers = Math.max(0, stats.total_answered - stats.incorrect_answers);

  return (
    <section
      className="overflow-hidden rounded-[var(--radius-2xl)] border border-default bg-surface shadow-[var(--shadow-default)]"
      aria-label="סיכום פעילות"
    >
      {/* Top row — overall numbers */}
      <div className="flex items-baseline justify-between border-b border-default px-5 py-4">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-secondary">
            סיכום פעילות
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display tabular-nums text-[2.5rem] font-black leading-none text-[var(--accent-ink)]">
              {stats.total_answered}
            </span>
            <span className="text-[13px] text-secondary">שאלות נענו</span>
          </div>
          <div className="mt-1.5 tabular-nums text-xs text-secondary">
            {correctAnswers} נכונות · {stats.incorrect_answers} שגויות
          </div>
        </div>
        <div className="text-left">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-secondary">
            זמן לימוד
          </div>
          <div className="font-display tabular-nums mt-2 text-2xl font-black leading-none text-[var(--accent-ink)]">
            {formatStudyTime(stats.total_study_seconds)}
          </div>
        </div>
      </div>

      {/* Part breakdown bars */}
      <div className="space-y-3 px-5 py-4">
        <PartSuccessBar
          label="דין דיוני · חלק ב׳"
          rate={stats.part_b.success_rate}
          answered={stats.part_b.total_answered}
        />
        <PartSuccessBar
          label="דין מהותי · חלק ג׳"
          rate={stats.part_c.success_rate}
          answered={stats.part_c.total_answered}
        />
      </div>

      {/* Amber ribbon docked at bottom — only when mistakes exist */}
      {mistakesCount > 0 && (
        <button
          type="button"
          onClick={onMistakesClick}
          className="focus-ring flex w-full items-center gap-3 px-5 py-3 text-right text-sm font-semibold transition active:scale-[0.99]"
          style={{
            borderTop: "1px solid var(--amber-300)",
            background: "var(--amber-50)",
            color: "var(--amber-800)",
          }}
        >
          <CircleAlert className="h-[18px] w-[18px] shrink-0" strokeWidth={2.2} />
          <span className="flex-1">חזרה על {mistakesCount} טעויות פתוחות</span>
        </button>
      )}
    </section>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    status,
    activeSessions,
    allSessions,
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
  const primarySession = activeSessions[0];
  const streak = computeStreak(allSessions);

  const tagline = primarySession
    ? "יש לך תרגול פתוח שמחכה להמשך."
    : !stats || totalAnswered === 0
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
    <div className="mx-auto w-full max-w-2xl px-4 pb-12 pt-4 sm:px-6">

      {/* Date eyebrow */}
      <div className="flex items-center justify-between pb-0 pt-2">
        <span className="text-[11px] uppercase tracking-[0.22em] text-secondary">
          {formatHebrewDate(now)}
        </span>
      </div>

      {/* Compact greeting */}
      <header className="mt-3">
        <h1 className="font-display flex flex-wrap items-baseline gap-2.5 text-[1.875rem] font-black leading-tight text-[var(--accent-ink)]">
          <span>{greetingForHour(now.getHours())}</span>
          {user?.full_name && (
            <span className="text-lg font-medium text-secondary">
              {user.full_name}
            </span>
          )}
        </h1>
        <p className="mt-2 text-sm leading-6 text-secondary">{tagline}</p>
      </header>

      {/* Primary CTA */}
      <div className="mt-5">
        {primarySession ? (
          <div className="space-y-3">
            <ActiveSessionCard
              session={primarySession}
              onResume={() => navigate(resumePath(primarySession))}
            />
            {activeSessions.length > 1 && (
              <button
                type="button"
                onClick={() => navigate("/sessions/active")}
                className="w-full text-center text-xs text-secondary underline underline-offset-2"
              >
                ועוד {activeSessions.length - 1} תרגולים פתוחים
              </button>
            )}
          </div>
        ) : (
          <Button fullWidth onClick={() => navigate(ROUTES.practiceNew)}>
            התחל תרגול
          </Button>
        )}

        {sessionsUnavailable && (
          <p className="mt-3 rounded-2xl border border-default bg-surface-muted px-4 py-3 text-xs text-secondary">
            לא ניתן לטעון תרגול פעיל כרגע.
          </p>
        )}
      </div>

      {/* Progress composite card */}
      {stats && totalAnswered > 0 && (
        <div className="mt-5">
          <HomeProgressCard
            stats={stats}
            mistakesCount={mistakesCount}
            onMistakesClick={() => navigate(ROUTES.mistakes)}
          />
        </div>
      )}

      {/* Standalone mistakes ribbon (when no stats yet but mistakes exist) */}
      {(!stats || totalAnswered === 0) && mistakesCount > 0 && (
        <button
          type="button"
          onClick={() => navigate(ROUTES.mistakes)}
          className="focus-ring mt-5 flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-right text-sm font-semibold transition active:scale-[0.99]"
          style={{
            borderColor: "var(--amber-300)",
            background: "var(--amber-50)",
            color: "var(--amber-800)",
          }}
        >
          <CircleAlert className="h-[18px] w-[18px] shrink-0" strokeWidth={2.2} />
          <span className="flex-1">חזרה על {mistakesCount} טעויות פתוחות</span>
        </button>
      )}

      {/* Streak card */}
      {!sessionsUnavailable && (
        <div className="mt-5">
          <StreakCard streak={streak} />
        </div>
      )}

      {/* Study routes */}
      <StudyRoutesList
        mistakesHint={mistakesHint}
        bookmarksHint={bookmarksHint}
        startingSimulation={startingSim}
        onStartPractice={() => navigate(ROUTES.practiceNew)}
        onStartExam={() => navigate(`${ROUTES.practiceNew}?flow=exam`)}
        onStartSimulation={handleStartSimulation}
        onOpenQuestions={() => navigate(ROUTES.questions)}
        onOpenMistakes={() => navigate(ROUTES.mistakes)}
        onOpenBookmarks={() => navigate(ROUTES.bookmarks)}
      />

      {/* Compact session counters */}
      {stats && (
        <section className="mt-6">
          <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-secondary">
            סשנים שהושלמו
          </p>
          <div className="grid grid-cols-3 gap-2">
            <SessionCountChip label="תרגולים" value={stats.practices_completed} />
            <SessionCountChip label="מבחנים" value={stats.exams_completed} />
            <SessionCountChip label="סימולציות" value={stats.simulations_completed} />
          </div>
        </section>
      )}

      {/* Simulation history */}
      <SimulationHistoryCard simulations={simulations} />
    </div>
  );
};

export default HomePage;
