import { z } from "zod";
import {
  AnswerOptionSchema,
  QuestionOptionsSchema,
  QuestionPartSchema,
} from "../sessions/schemas";

export const PracticeQuestionSchema = z.object({
  stable_id: z.string(),
  exam_date: z.string(),
  part: QuestionPartSchema,
  part_name: z.string(),
  label: z.string(),
  number: z.number().int(),
  body: z.string(),
  options: QuestionOptionsSchema,
  status: z.string(),
  invalidation_note: z.string().nullable(),
});

export const ReviewQuestionDetailSchema = PracticeQuestionSchema.extend({
  correct_answer: AnswerOptionSchema.nullable(),
  reference: z.string(),
});
