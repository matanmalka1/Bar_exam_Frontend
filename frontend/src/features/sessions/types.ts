export type SessionMode =
  | "practice"
  | "exam"
  | "simulation"
  | "mistakes"
  | "bookmarks";

export type SessionStatus = "active" | "completed" | "abandoned";

export type QuestionPart = "B" | "C";

export type AnswerOption = "א" | "ב" | "ג" | "ד";

export interface DraftAnswer {
  sessionId: number;
  stableId: string;
  selectedOption: AnswerOption;
  updatedAt: string;
}

export interface SessionSummary {
  id: number;
  user_id: number;
  mode: SessionMode;
  status: SessionStatus;
  exam_date: string | null;
  part: QuestionPart | null;
  total_questions: number;
  answered_count: number;
  correct_count: number | null;
  score_percent: string | null;
  started_at: string;
  completed_at: string | null;
  created_at: string;
}

export interface SessionCreateInput {
  user_id: number;
  mode: SessionMode;
  exam_date?: string;
  part?: QuestionPart | null;
  question_count?: number;
  include_invalidated?: boolean;
}

export interface SessionQuestion {
  stable_id: string;
  number: number;
  part: QuestionPart;
  body: string;
  options: Record<AnswerOption, string>;
}
