import { useQuery } from "@tanstack/react-query";
import { getStatsOverview } from "../api";

export const STATS_OVERVIEW_QUERY_KEY = ["stats", "overview"] as const;

export const useStatsOverview = () =>
  useQuery({
    queryKey: STATS_OVERVIEW_QUERY_KEY,
    queryFn: getStatsOverview,
  });
