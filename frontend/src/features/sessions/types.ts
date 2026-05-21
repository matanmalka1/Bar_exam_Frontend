import type { z } from "zod";
import type {
  AnswerExamOutSchema,
  AnswerOptionSchema,
  AnswerPracticeOutSchema,
  AnswerResultSchema,
  ExamMistakeBriefSchema,
  PartBreakdownSchema,
  QuestionOptionsSchema,
  QuestionPartSchema,
  SessionAnswerInlineSchema,
  SessionCompleteSchema,
  SessionDetailSchema,
  SessionModeSchema,
  SessionQuestionSchema,
  SessionStatusSchema,
  SessionSummarySchema,
} from "./schemas";

export type SessionMode = z.infer<typeof SessionModeSchema>;
export type SessionStatus = z.infer<typeof SessionStatusSchema>;
export type QuestionPart = z.infer<typeof QuestionPartSchema>;
export type AnswerOption = z.infer<typeof AnswerOptionSchema>;
export type QuestionOptions = z.infer<typeof QuestionOptionsSchema>;

export interface DraftAnswer {
  sessionId: number;
  stableId: string;
  selectedOption: AnswerOption;
  updatedAt: string;
}

export type SessionSummary = z.infer<typeof SessionSummarySchema>;
export type SessionAnswerInline = z.infer<typeof SessionAnswerInlineSchema>;
export type SessionQuestion = z.infer<typeof SessionQuestionSchema>;
export type SessionDetail = z.infer<typeof SessionDetailSchema>;

export interface SessionCreateInput {
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

export type AnswerPracticeOut = z.infer<typeof AnswerPracticeOutSchema>;
export type AnswerExamOut = z.infer<typeof AnswerExamOutSchema>;
export type AnswerResult = z.infer<typeof AnswerResultSchema>;
export type PartBreakdown = z.infer<typeof PartBreakdownSchema>;
export type ExamMistakeBrief = z.infer<typeof ExamMistakeBriefSchema>;
export type SessionComplete = z.infer<typeof SessionCompleteSchema>;
