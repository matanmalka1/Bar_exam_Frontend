import { api, DEV_USER_ID } from '../../lib/api'
import type { AnswerOption, QuestionPart } from './types'

// TODO: Replace `unknown` with shapes from backend/openapi.json once aligned.

interface PracticeSessionInput {
  exam_date?: string
  part?: QuestionPart | 'both'
}

export const createPracticeSession = async (input: PracticeSessionInput) => {
  const { data } = await api.post('/sessions', {
    user_id: DEV_USER_ID,
    mode: 'practice',
    ...input,
  })
  return data as unknown
}

export const createExamSession = async (examDate: string, part: QuestionPart | 'both') => {
  const { data } = await api.post('/sessions', {
    user_id: DEV_USER_ID,
    mode: 'exam',
    exam_date: examDate,
    part,
  })
  return data as unknown
}

export const createSimulationSession = async () => {
  const { data } = await api.post('/sessions', {
    user_id: DEV_USER_ID,
    mode: 'simulation',
  })
  return data as unknown
}

export const createMistakesSession = async () => {
  const { data } = await api.post('/sessions', {
    user_id: DEV_USER_ID,
    mode: 'mistakes',
  })
  return data as unknown
}

export const createBookmarksSession = async () => {
  const { data } = await api.post('/sessions', {
    user_id: DEV_USER_ID,
    mode: 'bookmarks',
  })
  return data as unknown
}

export const getSession = async (sessionId: number | string) => {
  const { data } = await api.get(`/sessions/${sessionId}`)
  return data as unknown
}

export const submitAnswer = async (
  sessionId: number | string,
  stableId: string,
  selectedOption: AnswerOption,
) => {
  const { data } = await api.post(`/sessions/${sessionId}/answers`, {
    stable_id: stableId,
    selected_answer: selectedOption,
  })
  return data as unknown
}

export const completeSession = async (sessionId: number | string) => {
  const { data } = await api.post(`/sessions/${sessionId}/submit`)
  return data as unknown
}

export const getActiveSessions = async () => {
  const { data } = await api.get('/sessions', {
    params: { user_id: DEV_USER_ID, status: 'active' },
  })
  return data as unknown
}
