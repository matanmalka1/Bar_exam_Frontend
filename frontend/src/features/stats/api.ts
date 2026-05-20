import { api, DEV_USER_ID } from '../../lib/api'
import type { StatsOverview } from './types'

export const getStatsOverview = async (): Promise<StatsOverview> => {
  const { data } = await api.get<StatsOverview>(
    `/users/${DEV_USER_ID}/stats/overview`,
  )
  return data
}
