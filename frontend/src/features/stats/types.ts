import type { z } from "zod";
import type { PartStatsSchema, StatsOverviewSchema } from "./schemas";

export type PartStats = z.infer<typeof PartStatsSchema>;
export type StatsOverview = z.infer<typeof StatsOverviewSchema>;
