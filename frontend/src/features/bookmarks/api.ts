import { api } from "../../lib/api";
import { parseApiResponse } from "../../lib/validation";
import {
  BookmarkedQuestionSchema,
  BookmarkRemovedSchema,
  BookmarkSchema,
} from "./schemas";
import type { z } from "zod";
import type { BookmarkedQuestion } from "./types";

export type Bookmark = z.infer<typeof BookmarkSchema>;

export type BookmarkRemoved = z.infer<typeof BookmarkRemovedSchema>;

const dedupeBookmarks = (
  bookmarks: BookmarkedQuestion[],
): BookmarkedQuestion[] => {
  const seen = new Set<string>();
  return bookmarks.filter((bookmark) => {
    if (seen.has(bookmark.stable_id)) return false;
    seen.add(bookmark.stable_id);
    return true;
  });
};

export const getBookmarks = async (): Promise<BookmarkedQuestion[]> => {
  const { data } = await api.get<unknown>("/users/me/bookmarks");
  const bookmarks = parseApiResponse(
    BookmarkedQuestionSchema.array(),
    data,
    "getBookmarks",
  );
  return dedupeBookmarks(bookmarks);
};

export const addBookmark = async (stableId: string): Promise<Bookmark> => {
  const { data } = await api.post<unknown>(`/users/me/bookmarks/${stableId}`);
  return parseApiResponse(BookmarkSchema, data, "addBookmark");
};

export const removeBookmark = async (
  stableId: string,
): Promise<BookmarkRemoved> => {
  const { data } = await api.delete<unknown>(
    `/users/me/bookmarks/${stableId}`,
  );
  return parseApiResponse(BookmarkRemovedSchema, data, "removeBookmark");
};
