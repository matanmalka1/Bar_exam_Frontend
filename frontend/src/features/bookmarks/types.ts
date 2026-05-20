import type { AnswerOption, QuestionPart } from '../sessions/types'

export interface BookmarkedQuestion {
  stable_id: string
  exam_date: string
  part: QuestionPart
  number: number
  body: string
  options: Record<AnswerOption, string>
  status: string
  correct_answer: AnswerOption | null
  reference: string
  created_at: string
}
