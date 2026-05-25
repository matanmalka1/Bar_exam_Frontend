import type { z } from "zod";
import type { ReviewQuestionSchema } from "./schemas";

export type ReviewQuestion = z.infer<typeof ReviewQuestionSchema>;
