import { api } from "../../lib/api";
import type { StatsOverview } from "./types";

export const getStatsOverview = async (): Promise<StatsOverview> => {
  const { data } = await api.get<StatsOverview>("/users/me/stats/overview");
  return data;
};
