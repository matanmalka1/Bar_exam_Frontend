import { useCallback, useState } from "react";
import { notifyError, notifySuccess } from "../../../lib/toast";
import { addBookmark, getBookmarks, removeBookmark } from "../../bookmarks/api";

const BOOKMARK_ERR = "לא ניתן לעדכן סימניה כרגע";

const updateBookmarkSet = (
  ids: Set<string>,
  stableId: string,
  bookmarked: boolean,
): Set<string> => {
  const nextIds = new Set(ids);
  if (bookmarked) {
    nextIds.add(stableId);
  } else {
    nextIds.delete(stableId);
  }
  return nextIds;
};

export const useSessionBookmarks = () => {
  const [bookmarkIds, setBookmarkIds] = useState<Set<string>>(() => new Set());
  const [bookmarkBusy, setBookmarkBusy] = useState(false);

  const loadBookmarks = useCallback(async (cancelled: () => boolean) => {
    try {
      const items = await getBookmarks();
      if (!cancelled()) {
        setBookmarkIds(new Set(items.map((item) => item.stable_id)));
      }
    } catch {
      if (!cancelled()) setBookmarkIds(new Set());
    }
  }, []);

  const toggleBookmark = useCallback(
    async (
      stableId: string,
      isBookmarked: boolean,
      options: { optimistic?: boolean } = {},
    ) => {
      if (bookmarkBusy) return;

      const nextBookmarked = !isBookmarked;
      const optimistic = options.optimistic ?? true;
      setBookmarkBusy(true);
      if (optimistic) {
        setBookmarkIds((ids) =>
          updateBookmarkSet(ids, stableId, nextBookmarked),
        );
      }

      try {
        if (nextBookmarked) {
          await addBookmark(stableId);
          if (!optimistic) {
            setBookmarkIds((ids) => updateBookmarkSet(ids, stableId, true));
          }
          notifySuccess("הסימניה נוספה");
        } else {
          await removeBookmark(stableId);
          if (!optimistic) {
            setBookmarkIds((ids) => updateBookmarkSet(ids, stableId, false));
          }
          notifySuccess("הסימניה הוסרה");
        }
      } catch {
        if (optimistic) {
          setBookmarkIds((ids) =>
            updateBookmarkSet(ids, stableId, isBookmarked),
          );
        }
        notifyError(BOOKMARK_ERR);
      } finally {
        setBookmarkBusy(false);
      }
    },
    [bookmarkBusy],
  );

  return {
    bookmarkBusy,
    bookmarkIds,
    loadBookmarks,
    toggleBookmark,
  };
};
