import { z } from "zod";

export const PartStatsSchema = z.object({
  total_answered: z.number().int(),
  success_rate: z.number().nullable(),
});

export const StatsOverviewSchema = z.object({
  total_answered: z.number().int(),
  overall_success_rate: z.number().nullable(),
  part_b: PartStatsSchema,
  part_c: PartStatsSchema,
  simulations_completed: z.number().int(),
  active_mistakes_count: z.number().int(),
  repeated_mistakes_count: z.number().int(),
  avg_session_duration_seconds: z.number().int().nullable(),
});
