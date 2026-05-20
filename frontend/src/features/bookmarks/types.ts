// TODO: align with backend /bookmarks response.
import type { QuestionPart } from '../sessions/types'

export interface BookmarkItem {
  stable_id: string
  exam_date: string
  part: QuestionPart
  question_number: number
  created_at: string
}
