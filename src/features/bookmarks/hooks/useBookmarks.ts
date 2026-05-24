import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HTTP_UNPROCESSABLE, isApiStatusError } from "../../../lib/api";
import { notifyError, notifySuccess } from "../../../lib/toast";
import { createBookmarksSession } from "../../sessions/api";
import { getBookmarks, removeBookmark } from "../api";
import type { BookmarkedQuestion } from "../types";

type Status = "loading" | "ready" | "error";

const REMOVE_ERR = "לא ניתן להסיר סימניה. נסה שוב";
const START_ERR = "לא ניתן להתחיל תרגול סימניות כרגע";
const START_EMPTY_ERR = "אין סימניות זמינות לתרגול";

export const useBookmarks = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("loading");
  const [bookmarks, setBookmarks] = useState<BookmarkedQuestion[]>([]);
  const [reloadKey, setReloadKey] = useState(0);
  const [removingStableId, setRemovingStableId] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getBookmarks()
      .then((data) => {
        if (cancelled) return;
        setBookmarks(data);
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

  const remove = async (stableId: string) => {
    setRemovingStableId(stableId);
    try {
      await removeBookmark(stableId);
      setBookmarks((items) =>
        items.filter((item) => item.stable_id !== stableId),
      );
      notifySuccess("הסימניה הוסרה");
    } catch {
      notifyError(REMOVE_ERR);
    } finally {
      setRemovingStableId(null);
    }
  };

  const startBookmarksPractice = async () => {
    if (starting || bookmarks.length === 0) return;
    setStarting(true);
    try {
      const session = await createBookmarksSession();
      navigate(`/session/${session.id}`);
    } catch (err) {
      notifyError(
        isApiStatusError(err, HTTP_UNPROCESSABLE) ? START_EMPTY_ERR : START_ERR,
      );
    } finally {
      setStarting(false);
    }
  };

  return {
    status,
    bookmarks,
    removingStableId,
    starting,
    retry,
    remove,
    startBookmarksPractice,
  };
};
