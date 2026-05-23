import { useEffect, useState } from "react";
import { listUserSessions } from "../../sessions/api";
import type { SessionSummary } from "../../sessions/types";

interface SessionHistoryState {
  sessions: SessionSummary[];
  loading: boolean;
  unavailable: boolean;
}

export const useSessionHistory = (): SessionHistoryState => {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listUserSessions("completed")
      .then((data) => {
        if (cancelled) return;
        setSessions(data);
        setUnavailable(false);
      })
      .catch(() => {
        if (cancelled) return;
        setUnavailable(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { sessions, loading, unavailable };
};
