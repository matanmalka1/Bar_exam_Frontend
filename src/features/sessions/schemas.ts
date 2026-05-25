import { z } from "zod";

export const SessionModeSchema = z.enum([
  "practice",
  "exam",
  "simulation",
  "mistakes",
  "bookmarks",
]);

export const SessionStatusSchema = z.enum(["active", "completed", "abandoned"]);

export const QuestionPartSchema = z.enum(["B", "C"]);
export const AnswerOptionSchema = z.enum(["א", "ב", "ג", "ד"]);
export const ScoringStatusSchema = z.enum([
  "correct",
  "incorrect",
  "invalidated",
]);

export const QuestionOptionsSchema = z.object({
  א: z.string(),
  ב: z.string(),
  ג: z.string(),
  ד: z.string(),
});

const DateTimeStringSchema = z.string().min(1);
const ScoreSchema = z.string();

const SessionPartBreakdownSchema = z.object({
  total: z.number().int(),
  answered: z.number().int(),
  correct: z.number().int(),
  score: ScoreSchema,
  max_score: z.number().int(),
});

export const SessionSummarySchema = z.object({
  id: z.number().int(),
  user_id: z.number().int(),
  mode: SessionModeSchema,
  status: SessionStatusSchema,
  exam_date: z.string().nullable(),
  part: QuestionPartSchema.nullable(),
  total_questions: z.number().int(),
  answered_count: z.number().int(),
  correct_count: z.number().int().nullable(),
  score: ScoreSchema.nullable(),
  max_score: z.number().int().nullable(),
  started_at: DateTimeStringSchema,
  completed_at: DateTimeStringSchema.nullable(),
  created_at: DateTimeStringSchema,
  part_breakdown: z.record(z.string(), SessionPartBreakdownSchema).nullable().optional(),
});

export const SessionAnswerInlineSchema = z.object({
  selected_answer: AnswerOptionSchema,
  is_correct: z.boolean().nullable().optional(),
  scoring_status: ScoringStatusSchema.nullable().optional(),
  answered_at: DateTimeStringSchema,
});

export const SessionQuestionSchema = z.object({
  position: z.number().int(),
  stable_id: z.string(),
  number: z.number().int(),
  body: z.string(),
  options: QuestionOptionsSchema,
  status: z.string(),
  invalidation_note: z.string().nullable().optional(),
  answer: SessionAnswerInlineSchema.nullable(),
  correct_answer: AnswerOptionSchema.nullable().optional(),
  reference: z.string().nullable().optional(),
});

export const SessionDetailSchema = SessionSummarySchema.extend({
  questions: z.array(SessionQuestionSchema),
});

export const AnswerPracticeOutSchema = z.object({
  stable_id: z.string(),
  selected_answer: AnswerOptionSchema,
  is_correct: z.boolean(),
  scoring_status: ScoringStatusSchema,
  correct_answer: AnswerOptionSchema.nullable(),
  reference: z.string().nullable(),
  answered_at: DateTimeStringSchema,
});

export const AnswerExamOutSchema = z.object({
  stable_id: z.string(),
  selected_answer: AnswerOptionSchema,
  scoring_status: ScoringStatusSchema.nullable().optional(),
  answered_at: DateTimeStringSchema,
});

export const AnswerResultSchema = z.union([
  AnswerPracticeOutSchema,
  AnswerExamOutSchema,
]);

export const PartBreakdownSchema = z.object({
  total: z.number().int(),
  answered: z.number().int(),
  correct: z.number().int(),
  score: ScoreSchema,
  max_score: z.number().int(),
});

const ExamMistakeBriefSchema = z.object({
  stable_id: z.string(),
  part: QuestionPartSchema,
  number: z.number().int(),
  body: z.string(),
  options: QuestionOptionsSchema,
  selected_answer: AnswerOptionSchema.nullable(),
  correct_answer: AnswerOptionSchema,
  reference: z.string(),
});

export const SessionCompleteSchema = z.object({
  id: z.number().int(),
  status: SessionStatusSchema,
  total_questions: z.number().int(),
  scorable_questions: z.number().int(),
  answered_count: z.number().int(),
  correct_count: z.number().int(),
  score: ScoreSchema,
  max_score: z.number().int(),
  completed_at: DateTimeStringSchema,
  part_breakdown: z
    .record(z.string(), PartBreakdownSchema)
    .nullable()
    .optional(),
  mistakes: z.array(ExamMistakeBriefSchema).nullable().optional(),
});
