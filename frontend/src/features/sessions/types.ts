// TODO: align with backend OpenAPI (backend/openapi.json).

export type SessionMode =
  | 'practice'
  | 'exam'
  | 'simulation'
  | 'mistakes'
  | 'bookmarks'

export type QuestionPart = 'B' | 'C'

export type AnswerOption = 'א' | 'ב' | 'ג' | 'ד'

export interface DraftAnswer {
  sessionId: number
  stableId: string
  selectedOption: AnswerOption
  updatedAt: string
}

// TODO: match backend Session response shape.
export interface SessionSummary {
  id: number
  mode: SessionMode
  total_questions: number
  answered_count?: number
  correct_count?: number
  score_percent?: number
}

// TODO: match backend Question response shape.
export interface SessionQuestion {
  stable_id: string
  number: number
  part: QuestionPart
  body: string
  options: Record<AnswerOption, string>
}
