export type SessionMode =
  | "practice"
  | "exam"
  | "simulation"
  | "mistakes"
  | "bookmarks";

export type SessionStatus = "active" | "completed" | "abandoned";

export type QuestionPart = "B" | "C";

export type AnswerOption = "א" | "ב" | "ג" | "ד";

export interface QuestionOptions {
  א: string;
  ב: string;
  ג: string;
  ד: string;
}

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

export interface SessionAnswerInline {
  selected_answer: AnswerOption;
  is_correct?: boolean | null;
  answered_at: string;
}

export interface SessionQuestion {
  position: number;
  stable_id: string;
  number: number;
  body: string;
  options: QuestionOptions;
  status: string;
  answer: SessionAnswerInline | null;
  correct_answer?: AnswerOption | null;
  reference?: string | null;
}

export interface SessionDetail extends SessionSummary {
  questions: SessionQuestion[];
}

export interface SessionCreateInput {
  user_id: number;
  mode: SessionMode;
  exam_date?: string;
  part?: QuestionPart | null;
  question_count?: number;
  include_invalidated?: boolean;
}

export interface AnswerSubmitPayload {
  stable_id: string;
  selected_answer: AnswerOption;
}

export interface AnswerPracticeOut {
  stable_id: string;
  selected_answer: AnswerOption;
  is_correct: boolean;
  correct_answer: AnswerOption | null;
  reference: string | null;
  answered_at: string;
}

export interface AnswerExamOut {
  stable_id: string;
  selected_answer: AnswerOption;
  answered_at: string;
}

export type AnswerResult = AnswerPracticeOut | AnswerExamOut;

export interface PartBreakdown {
  total: number;
  answered: number;
  correct: number;
  score_percent: string | null;
}

export interface ExamMistakeBrief {
  stable_id: string;
  selected_answer: AnswerOption;
  correct_answer: AnswerOption | null;
  reference: string | null;
}

export interface SessionComplete {
  id: number;
  status: SessionStatus;
  total_questions: number;
  scorable_questions: number;
  answered_count: number;
  correct_count: number;
  score_percent: string;
  completed_at: string;
  part_breakdown?: Record<string, PartBreakdown> | null;
  mistakes?: ExamMistakeBrief[] | null;
}
