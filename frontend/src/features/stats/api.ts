import { api, DEV_USER_ID } from '../../lib/api'

export const getStatsOverview = async () => {
  const { data } = await api.get('/stats/summary', {
    params: { user_id: DEV_USER_ID },
  })
  return data as unknown
}
