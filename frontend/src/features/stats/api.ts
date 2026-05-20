import { api, getDevUserId } from "../../lib/api";
import type { StatsOverview } from "./types";

export const getStatsOverview = async (): Promise<StatsOverview> => {
  const userId = await getDevUserId();
  const { data } = await api.get<StatsOverview>(
    `/users/${userId}/stats/overview`,
  );
  return data;
};
