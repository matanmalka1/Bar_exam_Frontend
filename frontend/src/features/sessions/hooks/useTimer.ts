import { useCallback, useEffect, useRef, useState } from "react";

const EXAM_SECONDS = 180 * 60;

const fmt = (s: number): string => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

const storageKey = (sessionId: string | number, kind: string) =>
  `timer_${kind}_${sessionId}`;

const loadSeconds = (key: string, fallback: number): number => {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? Number(v) : fallback;
  } catch {
    return fallback;
  }
};

const saveSeconds = (key: string, value: number) => {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // ignore
  }
};

const clearSeconds = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
};

export const useCountdownTimer = (sessionId: string | number, sessionCompleted = false) => {
  const key = storageKey(sessionId, "countdown");
  const [remaining, setRemaining] = useState(() =>
    loadSeconds(key, EXAM_SECONDS),
  );
  const [expired, setExpired] = useState(() => remaining <= 0);

  useEffect(() => {
    if (sessionCompleted) clearSeconds(key);
  }, [sessionCompleted, key]);

  useEffect(() => {
    if (expired) return;
    const id = setInterval(() => {
      setRemaining((prev) => {
        const next = prev - 1;
        saveSeconds(key, next);
        if (next <= 0) {
          clearInterval(id);
          setExpired(true);
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [expired, key]);

  const clear = useCallback(() => clearSeconds(key), [key]);

  return {
    remaining,
    expired,
    display: fmt(remaining),
    urgent: remaining <= 300,
    clearStorage: clear,
  };
};

export const useElapsedTimer = (
  sessionId: string | number,
  currentIndex: number,
  sessionCompleted = false,
) => {
  const key = storageKey(sessionId, "elapsed");
  const [total, setTotal] = useState(() => loadSeconds(key, 0));

  useEffect(() => {
    if (sessionCompleted) clearSeconds(key);
  }, [sessionCompleted, key]);
  const [questionSecs, setQuestionSecs] = useState(0);
  const prevIndexRef = useRef(currentIndex);

  useEffect(() => {
    const id = setInterval(() => {
      setTotal((t) => {
        const next = t + 1;
        saveSeconds(key, next);
        return next;
      });
      setQuestionSecs((q) => {
        if (prevIndexRef.current !== currentIndex) {
          prevIndexRef.current = currentIndex;
          return 0;
        }
        return q + 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [currentIndex, key]);

  const resetQuestion = useCallback(() => setQuestionSecs(0), []);

  const clear = useCallback(() => clearSeconds(key), [key]);

  return {
    totalDisplay: fmt(total),
    questionDisplay: fmt(questionSecs),
    resetQuestion,
    clearStorage: clear,
  };
};
