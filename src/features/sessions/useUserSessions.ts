import { useQuery } from "@tanstack/react-query";
import { listUserSessions } from "./api";
import type { SessionMode, SessionStatus } from "./types";

export const sessionsQueryKey = (status?: SessionStatus, mode?: SessionMode) =>
  ["sessions", status ?? "all", mode ?? "all"] as const;

export const useUserSessions = (status?: SessionStatus, mode?: SessionMode) =>
  useQuery({
    queryKey: sessionsQueryKey(status, mode),
    queryFn: () => listUserSessions(status, mode),
  });
