// TODO: align with backend /stats/summary response.
export interface StatsOverview {
  total_answered: number
  overall_correct_rate: number
  part_b_correct_rate: number
  part_c_correct_rate: number
  simulations_completed: number
  average_seconds_per_question: number
  repeated_mistakes: number
}
