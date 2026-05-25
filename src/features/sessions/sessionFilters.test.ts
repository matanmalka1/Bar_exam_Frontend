import { describe, expect, it } from "vitest";
import { isResumableSession } from "./sessionFilters";
import type { SessionSummary } from "./types";

const makeSession = (
  overrides: Partial<SessionSummary> = {},
): SessionSummary => ({
  id: 1,
  user_id: 1,
  mode: "practice",
  status: "active",
  exam_date: null,
  part: null,
  total_questions: 10,
  answered_count: 1,
  correct_count: null,
  score: null,
  max_score: null,
  started_at: "2026-05-24T10:00:00Z",
  completed_at: null,
  created_at: "2026-05-24T10:00:00Z",
  part_breakdown: null,
  ...overrides,
});

describe("isResumableSession", () => {
  it("keeps active sessions with at least one answered question", () => {
    expect(isResumableSession(makeSession({ answered_count: 1 }))).toBe(true);
  });

  it("hides active sessions that were opened but never started", () => {
    expect(isResumableSession(makeSession({ answered_count: 0 }))).toBe(false);
  });

  it("hides non-active sessions even when they have answers", () => {
    expect(
      isResumableSession(
        makeSession({
          status: "completed",
          answered_count: 10,
          completed_at: "2026-05-24T10:10:00Z",
        }),
      ),
    ).toBe(false);
  });
});
