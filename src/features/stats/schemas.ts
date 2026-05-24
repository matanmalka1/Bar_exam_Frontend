import { z } from "zod";

const PartStatsSchema = z.object({
  total_answered: z.number().int(),
  success_rate: z.number().nullable(),
});

export const StatsOverviewSchema = z.object({
  total_answered: z.number().int(),
  overall_success_rate: z.number().nullable(),
  mastery_rate: z.number().nullable(),
  unique_answered_questions: z.number().int(),
  total_answer_attempts: z.number().int(),
  latest_correct_answers: z.number().int(),
  part_b: PartStatsSchema,
  part_c: PartStatsSchema,
  simulations_completed: z.number().int(),
  active_mistakes_count: z.number().int(),
  repeated_mistakes_count: z.number().int(),
  avg_session_duration_seconds: z.number().int().nullable(),
  practices_completed: z.number().int(),
  exams_completed: z.number().int(),
  incorrect_answers: z.number().int(),
  total_study_seconds: z.number().int(),
});
