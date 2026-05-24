import { api } from "../../lib/api";
import { parseApiResponse } from "../../lib/validation";
import { ExamSummarySchema } from "./schemas";
import type { ExamSummary } from "./types";

export const getExams = async (): Promise<ExamSummary[]> => {
  const { data } = await api.get<unknown>("/exams");
  return parseApiResponse(ExamSummarySchema.array(), data, "getExams");
};
