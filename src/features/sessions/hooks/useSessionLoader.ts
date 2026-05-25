import { useCallback, useEffect, useState } from "react";
import { getPracticeSession } from "../api";
import type { SessionDetail } from "../types";
import { useSessionBookmarks } from "./useSessionBookmarks";

type Status = "loading" | "ready" | "error";

interface UseSessionLoaderOptions {
  sessionId: string | undefined;
  validate: (data: SessionDetail, sessionId: string) => boolean;
  onReady?: (data: SessionDetail) => void;
}

interface UseSessionLoaderResult {
  status: Status;
  session: SessionDetail | null;
  reloadKey: number;
  bookmarkBusy: boolean;
  bookmarkIds: Set<string>;
  loadBookmarks: (isCancelled: () => boolean) => Promise<void>;
  retry: () => void;
}

export const useSessionLoader = ({
  sessionId,
  validate,
  onReady,
}: UseSessionLoaderOptions): UseSessionLoaderResult => {
  const [status, setStatus] = useState<Status>("loading");
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const { bookmarkBusy, bookmarkIds, loadBookmarks } = useSessionBookmarks();

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!sessionId) {
        setStatus("error");
        return;
      }

      setStatus("loading");
      setSession(null);

      try {
        const data = await getPracticeSession(sessionId);
        if (cancelled) return;

        if (!validate(data, sessionId)) return;

        setSession(data);
        setStatus("ready");
        onReady?.(data);

        void loadBookmarks(() => cancelled);
      } catch {
        if (!cancelled) setStatus("error");
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [sessionId, reloadKey, validate, onReady, loadBookmarks]);

  const retry = useCallback(() => {
    setStatus("loading");
    setSession(null);
    setReloadKey((k) => k + 1);
  }, []);

  return { status, session, reloadKey, bookmarkBusy, bookmarkIds, loadBookmarks, retry };
};
