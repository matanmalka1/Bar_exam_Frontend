import { useUserSessions } from "../../sessions/useUserSessions";
import type { SessionSummary } from "../../sessions/types";

interface SessionHistoryState {
  sessions: SessionSummary[];
  loading: boolean;
  unavailable: boolean;
}

export const useSessionHistory = (): SessionHistoryState => {
  const { data, isLoading, isError } = useUserSessions("completed");

  return {
    sessions: data ?? [],
    loading: isLoading,
    unavailable: isError,
  };
};
