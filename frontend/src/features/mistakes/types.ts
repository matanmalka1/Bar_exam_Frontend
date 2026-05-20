import type {
  AnswerOption,
  QuestionOptions,
  QuestionPart,
} from "../sessions/types";

export interface MistakeItem {
  stable_id: string;
  number: number;
  exam_date: string;
  part: QuestionPart;
  body: string;
  options: QuestionOptions;
  correct_answer: AnswerOption | null;
  reference: string;
  times_answered: number;
  times_wrong: number;
}
