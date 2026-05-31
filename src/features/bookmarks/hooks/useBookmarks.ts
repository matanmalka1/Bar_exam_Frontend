import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HTTP_UNPROCESSABLE, isApiStatusError } from "../../../lib/api";
import { notifyError, notifySuccess } from "../../../lib/toast";
import { createBookmarksSession } from "../../sessions/api";
import { removeBookmark } from "../api";
import {
  useBookmarksQuery,
  useInvalidateBookmarks,
  useRemoveBookmarkFromCache,
} from "./useBookmarksQuery";

type Status = "loading" | "ready" | "error";

const REMOVE_ERR = "לא ניתן להסיר סימניה. נסה שוב";
const START_ERR = "לא ניתן להתחיל תרגול סימניות כרגע";
const START_EMPTY_ERR = "אין סימניות זמינות לתרגול";

export const useBookmarks = () => {
  const navigate = useNavigate();
  const { data: bookmarks = [], isLoading, isError } = useBookmarksQuery();
  const invalidateBookmarks = useInvalidateBookmarks();
  const removeBookmarkFromCache = useRemoveBookmarkFromCache();
  const [removingStableId, setRemovingStableId] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const status: Status = isLoading ? "loading" : isError ? "error" : "ready";

  const retry = () => invalidateBookmarks();

  const remove = async (stableId: string) => {
    setRemovingStableId(stableId);
    try {
      await removeBookmark(stableId);
      removeBookmarkFromCache(stableId);
      notifySuccess("הסימניה הוסרה");
      void invalidateBookmarks();
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
