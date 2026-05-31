import { useUserSessions } from "../../sessions/useUserSessions";
import type { SessionSummary } from "../../sessions/types";

type Status = "loading" | "ok" | "error";

export const useSimulationHistory = (): { status: Status; simulations: SessionSummary[] } => {
  const { data, isLoading, isError } = useUserSessions("completed", "simulation");

  const status: Status = isLoading ? "loading" : isError ? "error" : "ok";
  const simulations = data ? data.slice(-10).reverse() : [];

  return { status, simulations };
};
