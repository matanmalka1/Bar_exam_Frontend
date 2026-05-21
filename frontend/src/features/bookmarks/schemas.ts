import { z } from "zod";
import {
  AnswerOptionSchema,
  QuestionOptionsSchema,
  QuestionPartSchema,
} from "../sessions/schemas";

const DateTimeStringSchema = z.string().min(1);

export const BookmarkedQuestionSchema = z.object({
  stable_id: z.string(),
  exam_date: z.string(),
  part: QuestionPartSchema,
  number: z.number().int(),
  body: z.string(),
  options: QuestionOptionsSchema,
  status: z.string(),
  correct_answer: AnswerOptionSchema.nullable(),
  reference: z.string(),
  created_at: DateTimeStringSchema,
});

export const BookmarkSchema = z.object({
  user_id: z.number().int(),
  stable_id: z.string(),
  created_at: DateTimeStringSchema,
});

export const BookmarkRemovedSchema = z.object({
  removed: z.boolean(),
});
