import type { z } from "zod";
import type { StatsOverviewSchema } from "./schemas";

export type StatsOverview = z.infer<typeof StatsOverviewSchema>;
