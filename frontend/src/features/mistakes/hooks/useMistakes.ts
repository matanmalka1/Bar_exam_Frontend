import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HTTP_UNPROCESSABLE, isApiStatusError } from "../../../lib/api";
import { createMistakesSession } from "../../sessions/api";
import { getMistakes } from "../api";
import type { MistakeItem } from "../types";

type Status = "loading" | "ready" | "error";

export const useMistakes = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("loading");
  const [items, setItems] = useState<MistakeItem[]>([]);
  const [reloadKey, setReloadKey] = useState(0);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getMistakes()
      .then((data) => {
        if (cancelled) return;
        setItems(data);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const retry = () => {
    setStatus("loading");
    setReloadKey((key) => key + 1);
  };

  const startMistakesPractice = async () => {
    if (starting || items.length === 0) return;
    setStartError(null);
    setStarting(true);
    try {
      const session = await createMistakesSession();
      navigate(`/session/${session.id}`);
    } catch (err) {
      setStartError(
        isApiStatusError(err, HTTP_UNPROCESSABLE)
          ? "אין טעויות זמינות לתרגול"
          : "לא ניתן להתחיל תרגול טעויות כרגע",
      );
    } finally {
      setStarting(false);
    }
  };

  return {
    status,
    items,
    starting,
    startError,
    retry,
    startMistakesPractice,
  };
};
