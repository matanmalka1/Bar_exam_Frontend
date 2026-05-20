import { api, DEV_USER_ID } from "../../lib/api";
import type { QuestionPart } from "../sessions/types";

interface GetMistakesParams {
  examDate?: string;
  part?: QuestionPart;
}

export const getMistakes = async (params: GetMistakesParams = {}) => {
  const { data } = await api.get("/mistakes", {
    params: {
      user_id: DEV_USER_ID,
      exam_date: params.examDate,
      part: params.part,
    },
  });
  return data as unknown;
};
