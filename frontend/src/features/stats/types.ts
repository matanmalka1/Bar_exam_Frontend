export interface PartStats {
  answered: number
  correct: number
  success_rate: number | null
}

export interface StatsOverview {
  total_answered: number
  overall_success_rate: number | null
  part_b: PartStats
  part_c: PartStats
  simulations_completed: number
  active_mistakes_count: number
  repeated_mistakes_count: number
  avg_session_duration_seconds: number | null
}
