import type { SessionSummary } from "./types";

export const isResumableSession = (session: SessionSummary): boolean =>
  session.status === "active" && session.answered_count > 0;
