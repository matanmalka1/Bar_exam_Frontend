import { useEffect, useState } from "react";
import { getBookmarks } from "../../bookmarks/api";
import type { BookmarkedQuestion } from "../../bookmarks/types";
import { listUserSessions } from "../../sessions/api";
import type { SessionSummary } from "../../sessions/types";
import { getStatsOverview } from "../../stats/api";
import type { StatsOverview } from "../../stats/types";

type Status = "loading" | "ready";

interface HomeOverview {
  status: Status;
  activeSessions: SessionSummary[];
  stats: StatsOverview | null;
  bookmarks: BookmarkedQuestion[];
  sessionsUnavailable: boolean;
  statsUnavailable: boolean;
  bookmarksUnavailable: boolean;
}

const getActiveSessions = (sessions: SessionSummary[]): SessionSummary[] =>
  sessions.filter((session) => session.status === "active");

export const useHomeOverview = (): HomeOverview => {
  const [status, setStatus] = useState<Status>("loading");
  const [activeSessions, setActiveSessions] = useState<SessionSummary[]>([]);
  const [stats, setStats] = useState<StatsOverview | null>(null);
  const [statsUnavailable, setStatsUnavailable] = useState(false);
  const [bookmarks, setBookmarks] = useState<BookmarkedQuestion[]>([]);
  const [bookmarksUnavailable, setBookmarksUnavailable] = useState(false);
  const [sessionsUnavailable, setSessionsUnavailable] = useState(false);

  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([
      listUserSessions(),
      getStatsOverview(),
      getBookmarks(),
    ]).then(([sessionsResult, statsResult, bookmarksResult]) => {
      if (cancelled) return;

      if (sessionsResult.status === "fulfilled") {
        setActiveSessions(getActiveSessions(sessionsResult.value));
        setSessionsUnavailable(false);
      } else {
        setActiveSessions([]);
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

  return {
    status,
    activeSessions,
    stats,
    bookmarks,
    sessionsUnavailable,
    statsUnavailable,
    bookmarksUnavailable,
  };
};
