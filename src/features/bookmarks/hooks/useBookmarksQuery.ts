import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getBookmarks } from "../api";
import type { BookmarkedQuestion } from "../types";

export const BOOKMARKS_QUERY_KEY = ["bookmarks"] as const;

export const useBookmarksQuery = () =>
  useQuery({
    queryKey: BOOKMARKS_QUERY_KEY,
    queryFn: getBookmarks,
  });

export const useInvalidateBookmarks = () => {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: BOOKMARKS_QUERY_KEY });
};

export const useRemoveBookmarkFromCache = () => {
  const qc = useQueryClient();
  return (stableId: string) => {
    qc.setQueryData<BookmarkedQuestion[]>(BOOKMARKS_QUERY_KEY, (items) =>
      items?.filter((item) => item.stable_id !== stableId),
    );
  };
};
