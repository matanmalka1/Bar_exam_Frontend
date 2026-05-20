import type { QuestionPart } from "../sessions/types";

export interface ExamSummary {
  exam_date: string;
  part: QuestionPart;
  part_name: string;
  label: string;
  question_count: number;
}
