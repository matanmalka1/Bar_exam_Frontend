import type { z } from "zod";
import type { ExamSummarySchema } from "./schemas";

export type ExamSummary = z.infer<typeof ExamSummarySchema>;
