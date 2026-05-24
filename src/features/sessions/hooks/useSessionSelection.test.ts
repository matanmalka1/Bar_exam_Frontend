// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import type { SessionDetail } from "../types";
import { useExamSession } from "./useExamSession";
import { usePracticeSession } from "./usePracticeSession";

const getPracticeSessionMock = vi.fn();
const loadBookmarksMock = vi.fn();
const toggleBookmarkMock = vi.fn();

vi.mock("../api", () => ({
  completeSession: vi.fn(),
  getPracticeSession: (...args: unknown[]) => getPracticeSessionMock(...args),
  submitAnswer: vi.fn(),
}));

vi.mock("./useSessionBookmarks", () => ({
  useSessionBookmarks: () => ({
    bookmarkBusy: false,
    bookmarkIds: new Set<string>(),
    loadBookmarks: loadBookmarksMock,
    toggleBookmark: toggleBookmarkMock,
  }),
}));

const makeSession = (mode: SessionDetail["mode"]): SessionDetail => ({
  id: 10,
  user_id: 1,
  mode,
  status: "active",
  exam_date: null,
  part: "B",
  total_questions: 1,
  answered_count: 0,
  correct_count: null,
  score_percent: null,
  started_at: "2026-05-23T10:00:00Z",
  completed_at: null,
  created_at: "2026-05-23T10:00:00Z",
  part_breakdown: null,
  questions: [
    {
      position: 1,
      stable_id: "2025-04_B_001",
      number: 1,
      body: "גוף שאלה",
      options: {
        א: "אפשרות ראשונה",
        ב: "אפשרות שניה",
        ג: "אפשרות שלישית",
        ד: "אפשרות רביעית",
      },
      status: "active",
      answer: null,
      correct_answer: null,
      reference: null,
    },
  ],
});

beforeEach(() => {
  getPracticeSessionMock.mockReset();
  loadBookmarksMock.mockReset();
  toggleBookmarkMock.mockReset();
});

describe("session answer selection", () => {
  test("practice selection toggles off when selecting the same answer again", async () => {
    getPracticeSessionMock.mockResolvedValue(makeSession("practice"));
    const onRedirectToExam = vi.fn();
    const onComplete = vi.fn();

    const { result } = renderHook(() =>
      usePracticeSession({
        sessionId: "10",
        onRedirectToExam,
        onComplete,
      }),
    );

    await waitFor(() => expect(result.current.status).toBe("ready"));

    act(() => result.current.selectAnswer("א"));
    await waitFor(() => expect(result.current.displaySelected).toBe("א"));

    act(() => result.current.selectAnswer("א"));
    await waitFor(() => expect(result.current.displaySelected).toBeNull());
  });

  test("exam selection toggles off when selecting the same answer again", async () => {
    getPracticeSessionMock.mockResolvedValue(makeSession("exam"));
    const onRedirectToPractice = vi.fn();
    const onComplete = vi.fn();

    const { result } = renderHook(() =>
      useExamSession({
        sessionId: "10",
        onRedirectToPractice,
        onComplete,
      }),
    );

    await waitFor(() => expect(result.current.status).toBe("ready"));

    act(() => result.current.selectAnswer("ב"));
    await waitFor(() => expect(result.current.displaySelected).toBe("ב"));

    act(() => result.current.selectAnswer("ב"));
    await waitFor(() => expect(result.current.displaySelected).toBeNull());
  });
});
