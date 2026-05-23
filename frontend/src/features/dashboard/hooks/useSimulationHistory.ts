import { useEffect, useState } from "react";
import { listUserSessions } from "../../sessions/api";
import type { SessionSummary } from "../../sessions/types";

type Status = "loading" | "ok" | "error";

export const useSimulationHistory = () => {
  const [status, setStatus] = useState<Status>("loading");
  const [simulations, setSimulations] = useState<SessionSummary[]>([]);

  useEffect(() => {
    listUserSessions("completed", "simulation")
      .then((data) => {
        setSimulations(data);
        setStatus("ok");
      })
      .catch(() => setStatus("error"));
  }, []);

  return { status, simulations };
};
