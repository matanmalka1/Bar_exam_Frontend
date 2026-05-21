import type { z } from "zod";
import type { BookmarkedQuestionSchema } from "./schemas";

export type BookmarkedQuestion = z.infer<typeof BookmarkedQuestionSchema>;
