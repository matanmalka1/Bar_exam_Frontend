import { afterEach, describe, expect, test, vi } from "vitest";
import { z } from "zod";
import { SessionSummarySchema } from "../features/sessions/schemas";
import { parseApiResponse } from "./validation";

const validSessionSummary = {
  id: 1,
  user_id: 2,
  mode: "practice",
  status: "active",
  exam_date: null,
  part: null,
  total_questions: 10,
  answered_count: 0,
  correct_count: null,
  score_percent: null,
  started_at: "2026-05-21T10:00:00Z",
  completed_at: null,
  created_at: "2026-05-21T10:00:00Z",
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("parseApiResponse", () => {
  test("passes valid responses", () => {
    expect(
      parseApiResponse(SessionSummarySchema, validSessionSummary, "session"),
    ).toEqual(validSessionSummary);
  });

  test("throws a clear error for invalid responses", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    expect(() =>
      parseApiResponse(
        z.object({ count: z.number() }),
        { count: "1" },
        "counter",
      ),
    ).toThrow("Invalid API response: counter");
  });

  test("accepts nullable fields", () => {
    expect(
      parseApiResponse(SessionSummarySchema, validSessionSummary, "session")
        .completed_at,
    ).toBeNull();
  });

  test("fails enum mismatches", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    expect(() =>
      parseApiResponse(
        SessionSummarySchema,
        { ...validSessionSummary, status: "paused" },
        "session",
      ),
    ).toThrow("Invalid API response: session");
  });
});
