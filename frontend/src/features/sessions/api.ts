import { api } from "../../lib/api";
import { parseApiResponse } from "../../lib/validation";
import {
  AnswerResultSchema,
  SessionCompleteSchema,
  SessionDetailSchema,
  SessionSummarySchema,
} from "./schemas";
import type {
  AnswerResult,
  AnswerSubmitPayload,
  QuestionPart,
  SessionComplete,
  SessionCreateInput,
  SessionDetail,
  SessionStatus,
  SessionSummary,
} from "./types";

export const listUserSessions = async (
  status?: SessionStatus,
): Promise<SessionSummary[]> => {
  const { data } = await api.get<unknown>("/users/me/sessions", {
    params: status ? { status } : undefined,
  });
  return parseApiResponse(
    SessionSummarySchema.array(),
    data,
    "listUserSessions",
  );
};

export const getActiveSessions = () => listUserSessions("active");

const createSession = async (
  input: SessionCreateInput,
): Promise<SessionSummary> => {
  const { data } = await api.post<unknown>("/practice-sessions", input);
  return parseApiResponse(SessionSummarySchema, data, "createSession");
};

export const createPracticeSession = (input: {
  part?: QuestionPart | null;
  exam_date?: string;
  question_count?: number;
}) => createSession({ mode: "practice", ...input });

export const createExamSession = (examDate: string, part?: QuestionPart) =>
  createSession({ mode: "exam", exam_date: examDate, part });

export const createSimulationSession = () =>
  createSession({ mode: "simulation" });

export const createMistakesSession = () => createSession({ mode: "mistakes" });

export const createBookmarksSession = () =>
  createSession({ mode: "bookmarks" });

export const getPracticeSession = async (
  sessionId: number | string,
): Promise<SessionDetail> => {
  const { data } = await api.get<unknown>(
    `/practice-sessions/${sessionId}`,
  );
  return parseApiResponse(SessionDetailSchema, data, "getPracticeSession");
};

export const submitAnswer = async (
  sessionId: number | string,
  payload: AnswerSubmitPayload,
): Promise<AnswerResult> => {
  const { data } = await api.post<unknown>(
    `/practice-sessions/${sessionId}/answers`,
    payload,
  );
  return parseApiResponse(AnswerResultSchema, data, "submitAnswer");
};

export const completeSession = async (
  sessionId: number | string,
): Promise<SessionComplete> => {
  const { data } = await api.post<unknown>(
    `/practice-sessions/${sessionId}/complete`,
  );
  return parseApiResponse(SessionCompleteSchema, data, "completeSession");
};
