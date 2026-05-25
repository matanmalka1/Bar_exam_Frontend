import type { z } from "zod";
import type {
  PracticeQuestionSchema,
  ReviewQuestionDetailSchema,
} from "./schemas";

export type PracticeQuestion = z.infer<typeof PracticeQuestionSchema>;
export type ReviewQuestionDetail = z.infer<typeof ReviewQuestionDetailSchema>;
