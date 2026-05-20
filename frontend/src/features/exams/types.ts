// TODO: align with backend /exams response.
import type { QuestionPart } from '../sessions/types'

export interface ExamInfo {
  exam_date: string
  label: string
  part: QuestionPart
  part_name: string
}
