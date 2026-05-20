import { api, DEV_USER_ID } from "../../lib/api";
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
  const { data } = await api.get<SessionSummary[]>(
    `/users/${DEV_USER_ID}/sessions`,
    { params: status ? { status } : undefined },
  );
  return data;
};

export const getActiveSessions = () => listUserSessions("active");

const createSession = async (
  input: Omit<SessionCreateInput, "user_id">,
): Promise<SessionSummary> => {
  const { data } = await api.post<SessionSummary>("/practice-sessions", {
    user_id: DEV_USER_ID,
    ...input,
  });
  return data;
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
  const { data } = await api.get<SessionDetail>(
    `/practice-sessions/${sessionId}`,
  );
  return data;
};

export const submitAnswer = async (
  sessionId: number | string,
  payload: AnswerSubmitPayload,
): Promise<AnswerResult> => {
  const { data } = await api.post<AnswerResult>(
    `/practice-sessions/${sessionId}/answers`,
    payload,
  );
  return data;
};

export const completeSession = async (
  sessionId: number | string,
): Promise<SessionComplete> => {
  const { data } = await api.post<SessionComplete>(
    `/practice-sessions/${sessionId}/complete`,
  );
  return data;
};
