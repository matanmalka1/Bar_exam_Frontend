import { api } from "../../lib/api";
import type { ExamSummary } from "./types";

export const getExams = async (): Promise<ExamSummary[]> => {
  const { data } = await api.get<ExamSummary[]>("/exams");
  return data;
};
