import { api } from "../../lib/api";
import { parseApiResponse } from "../../lib/validation";
import { ReviewQuestionSchema } from "./schemas";
import type { ReviewQuestion } from "./types";

export const getReviewQuestions = async (
  examDate: string,
  part: "B" | "C",
): Promise<ReviewQuestion[]> => {
  const { data } = await api.get<unknown>("/questions/review", {
    params: { exam_date: examDate, part },
  });
  return parseApiResponse(ReviewQuestionSchema.array(), data, "getReviewQuestions");
};
