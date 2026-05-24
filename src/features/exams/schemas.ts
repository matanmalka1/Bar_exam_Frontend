import { z } from "zod";
import { QuestionPartSchema } from "../sessions/schemas";

export const ExamSummarySchema = z.object({
  exam_date: z.string(),
  part: QuestionPartSchema,
  part_name: z.string(),
  label: z.string(),
  question_count: z.number().int(),
});
