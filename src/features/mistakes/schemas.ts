import { z } from "zod";
import {
  AnswerOptionSchema,
  QuestionOptionsSchema,
  QuestionPartSchema,
} from "../sessions/schemas";

export const MistakeItemSchema = z.object({
  stable_id: z.string(),
  number: z.number().int(),
  exam_date: z.string(),
  part: QuestionPartSchema,
  body: z.string(),
  options: QuestionOptionsSchema,
  correct_answer: AnswerOptionSchema.nullable(),
  reference: z.string(),
  times_answered: z.number().int(),
  times_wrong: z.number().int(),
});
