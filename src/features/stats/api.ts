import { api } from "../../lib/api";
import { parseApiResponse } from "../../lib/validation";
import { StatsOverviewSchema } from "./schemas";
import type { StatsOverview } from "./types";

export const getStatsOverview = async (): Promise<StatsOverview> => {
  const { data } = await api.get<unknown>("/users/me/stats/overview");
  return parseApiResponse(StatsOverviewSchema, data, "getStatsOverview");
};
