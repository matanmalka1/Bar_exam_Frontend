// TODO: align with backend /mistakes response.
import type { QuestionPart } from '../sessions/types'

export interface MistakeItem {
  stable_id: string
  exam_date: string
  part: QuestionPart
  question_number: number
  wrong_count: number
  last_answered_at: string | null
}
