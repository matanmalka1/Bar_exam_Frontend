import { useBookmarksQuery } from "../../bookmarks/hooks/useBookmarksQuery";
import { useUserSessions } from "../../sessions/useUserSessions";
import { isResumableSession } from "../../sessions/sessionFilters";
import type { SessionSummary } from "../../sessions/types";
import { useStatsOverview } from "../../stats/hooks/useStatsOverview";
import type { StatsOverview } from "../../stats/types";
import type { BookmarkedQuestion } from "../../bookmarks/types";

type Status = "loading" | "ready";

interface HomeOverview {
  status: Status;
  activeSessions: SessionSummary[];
  allSessions: SessionSummary[];
  stats: StatsOverview | null;
  bookmarks: BookmarkedQuestion[];
  sessionsUnavailable: boolean;
  statsUnavailable: boolean;
  bookmarksUnavailable: boolean;
}

export const useHomeOverview = (): HomeOverview => {
  const sessionsQuery = useUserSessions();
  const statsQuery = useStatsOverview();
  const bookmarksQuery = useBookmarksQuery();

  const isLoading =
    sessionsQuery.isLoading || statsQuery.isLoading || bookmarksQuery.isLoading;

  const allSessions = sessionsQuery.data ?? [];

  return {
    status: isLoading ? "loading" : "ready",
    activeSessions: allSessions.filter(isResumableSession),
    allSessions,
    stats: statsQuery.data ?? null,
    bookmarks: bookmarksQuery.data ?? [],
    sessionsUnavailable: sessionsQuery.isError,
    statsUnavailable: statsQuery.isError,
    bookmarksUnavailable: bookmarksQuery.isError,
  };
};
