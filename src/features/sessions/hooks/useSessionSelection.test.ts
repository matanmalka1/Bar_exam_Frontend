// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import type { AnswerExamOut, SessionDetail } from "../types";
import { useExamSession } from "./useExamSession";
import { usePracticeSession } from "./usePracticeSession";

const getPracticeSessionMock = vi.fn();
const loadBookmarksMock = vi.fn();
const toggleBookmarkMock = vi.fn();

const submitAnswerMock = vi.fn();

vi.mock("../api", () => ({
  completeSession: vi.fn(),
  getPracticeSession: (...args: unknown[]) => getPracticeSessionMock(...args),
  submitAnswer: (...args: unknown[]) => submitAnswerMock(...args),
}));

vi.mock("./useSessionBookmarks", () => {
  // Stable object — same reference returned on every call to useSessionBookmarks()
  // so useSessionLoader's useEffect dep on loadBookmarks doesn't re-fire each render.
  const stable = {
    bookmarkBusy: false,
    bookmarkIds: new Set<string>(),
    loadBookmarks: (..._args: unknown[]) => Promise.resolve(),
    toggleBookmark: vi.fn(),
  };
  return { useSessionBookmarks: () => stable };
});

const makeSession = (mode: SessionDetail["mode"]): SessionDetail => ({
  id: 10,
  mode,
  status: "active",
  exam_date: null,
  part: "B",
  total_questions: 1,
  answered_count: 0,
  correct_count: null,
  score: null,
  max_score: null,
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
  submitAnswerMock.mockReset();
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

describe("exam answer submission state", () => {
  test("submitOrNext calls submitAnswer and does not receive is_correct from the API", async () => {
    getPracticeSessionMock.mockResolvedValue(makeSession("exam"));

    const examResult: AnswerExamOut = {
      stable_id: "2025-04_B_001",
      selected_answer: "א",
      answered_at: "2026-05-25T10:00:00Z",
    };
    submitAnswerMock.mockResolvedValue(examResult);

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
    await waitFor(() => expect(result.current.current).not.toBeNull());

    act(() => result.current.selectAnswer("א"));
    await waitFor(() => expect(result.current.displaySelected).toBe("א"));

    await act(async () => {
      await result.current.submitOrNext();
    });

    expect(submitAnswerMock).toHaveBeenCalledWith("10", {
      stable_id: "2025-04_B_001",
      selected_answer: "א",
    });

    // exam answer response has no is_correct / scoring_status
    const callResult = await submitAnswerMock.mock.results[0].value as AnswerExamOut;
    expect("is_correct" in callResult).toBe(false);
    expect("correct_answer" in callResult).toBe(false);
  });
});
