import { api } from "../../lib/api";
import { parseApiResponse } from "../../lib/validation";
import { PracticeQuestionSchema, ReviewQuestionDetailSchema } from "./schemas";
import type { PracticeQuestion, ReviewQuestionDetail } from "./types";

export const getQuestions = async (
  examDate: string,
  part: "B" | "C",
): Promise<PracticeQuestion[]> => {
  const { data } = await api.get<unknown>("/questions", {
    params: { exam_date: examDate, part },
  });
  return parseApiResponse(PracticeQuestionSchema.array(), data, "getQuestions");
};

export const getQuestionsForReview = async (
  examDate: string,
  part: "B" | "C",
): Promise<ReviewQuestionDetail[]> => {
  const { data } = await api.get<unknown>("/questions/review", {
    params: { exam_date: examDate, part },
  });
  return parseApiResponse(
    ReviewQuestionDetailSchema.array(),
    data,
    "getQuestionsForReview",
  );
};

export const getQuestion = async (
  stableId: string,
): Promise<PracticeQuestion> => {
  const { data } = await api.get<unknown>(`/questions/${stableId}`);
  return parseApiResponse(PracticeQuestionSchema, data, "getQuestion");
};

export const getQuestionForReview = async (
  stableId: string,
): Promise<ReviewQuestionDetail> => {
  const { data } = await api.get<unknown>(`/questions/${stableId}/review`);
  return parseApiResponse(
    ReviewQuestionDetailSchema,
    data,
    "getQuestionForReview",
  );
};
