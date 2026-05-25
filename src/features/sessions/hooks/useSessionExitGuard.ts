import { useCallback, useEffect, useRef, useState } from "react";
import { useBlocker } from "react-router-dom";
import { isApiStatusError } from "../../../lib/api";
import { notifyError } from "../../../lib/toast";
import { abandonSession, abandonSessionOnUnload } from "../api";

const EXIT_ERR = "לא ניתן לצאת מהתרגול כרגע. נסה שוב";

type UseSessionExitGuardOptions = {
  sessionId: string | undefined;
  enabled: boolean;
  answeredCount: number;
  onDiscard?: () => void;
};

const sessionPath = (sessionId: string, suffix = "") => `/session/${sessionId}${suffix}`;

const isSameSessionPath = (pathname: string, sessionId: string): boolean =>
  pathname === sessionPath(sessionId) ||
  pathname === sessionPath(sessionId, "/exam") ||
  pathname === sessionPath(sessionId, "/results");

const isAlreadyInactiveSessionError = (err: unknown): boolean =>
  isApiStatusError(err, 404) || isApiStatusError(err, 409);

export const useSessionExitGuard = ({
  sessionId,
  enabled,
  answeredCount,
  onDiscard,
}: UseSessionExitGuardOptions) => {
  const [promptOpen, setPromptOpen] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const discardingRef = useRef(false);

  const shouldBlock = useCallback(
    ({
      currentLocation,
      nextLocation,
    }: {
      currentLocation: { pathname: string };
      nextLocation: { pathname: string };
    }) => {
      if (!enabled || !sessionId) return false;
      if (currentLocation.pathname === nextLocation.pathname) return false;
      return !isSameSessionPath(nextLocation.pathname, sessionId);
    },
    [enabled, sessionId],
  );

  const blocker = useBlocker(shouldBlock);
  const blockerRef = useRef(blocker);

  useEffect(() => {
    blockerRef.current = blocker;
  }, [blocker]);

  const proceedIfBlocked = useCallback(() => {
    const latestBlocker = blockerRef.current;
    if (latestBlocker.state !== "blocked") return;

    try {
      latestBlocker.proceed();
    } catch (err) {
      if (
        err instanceof Error &&
        err.message.includes("Invalid blocker state transition")
      ) {
        return;
      }
      throw err;
    }
  }, []);

  const resetIfBlocked = useCallback(() => {
    const latestBlocker = blockerRef.current;
    if (latestBlocker.state !== "blocked") return;
    latestBlocker.reset();
  }, []);

  const discardAndProceed = useCallback(async () => {
    if (!sessionId || blocker.state !== "blocked" || discardingRef.current) {
      setPromptOpen(false);
      return;
    }

    discardingRef.current = true;
    setDiscarding(true);
    try {
      await abandonSession(sessionId);
      onDiscard?.();
      setPromptOpen(false);
      proceedIfBlocked();
    } catch (err) {
      if (answeredCount === 0 || isAlreadyInactiveSessionError(err)) {
        onDiscard?.();
        setPromptOpen(false);
        proceedIfBlocked();
        return;
      }

      notifyError(EXIT_ERR);
      setPromptOpen(false);
      resetIfBlocked();
    } finally {
      discardingRef.current = false;
      setDiscarding(false);
    }
  }, [
    answeredCount,
    blocker.state,
    onDiscard,
    proceedIfBlocked,
    resetIfBlocked,
    sessionId,
  ]);

  useEffect(() => {
    if (blocker.state !== "blocked" || promptOpen || discarding) return;

    const timer = window.setTimeout(() => {
      if (answeredCount === 0) {
        void discardAndProceed();
        return;
      }

      setPromptOpen(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [
    answeredCount,
    blocker.state,
    discardAndProceed,
    discarding,
    promptOpen,
  ]);

  useEffect(() => {
    if (!enabled || !sessionId) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (answeredCount === 0) {
        onDiscard?.();
        abandonSessionOnUnload(sessionId);
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [answeredCount, enabled, onDiscard, sessionId]);

  const saveAndExit = useCallback(() => {
    if (blocker.state !== "blocked") {
      setPromptOpen(false);
      return;
    }
    setPromptOpen(false);
    proceedIfBlocked();
  }, [blocker.state, proceedIfBlocked]);

  const stay = useCallback(() => {
    setPromptOpen(false);
    if (blocker.state !== "blocked") return;
    resetIfBlocked();
  }, [blocker.state, resetIfBlocked]);

  return {
    promptOpen,
    discarding,
    saveAndExit,
    discardAndExit: discardAndProceed,
    stay,
  };
};
