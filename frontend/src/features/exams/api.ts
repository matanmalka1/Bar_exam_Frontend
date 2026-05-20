import { api } from '../../lib/api'

export const getExams = async () => {
  const { data } = await api.get('/exams')
  return data as unknown
}
