import { api, getDevUserId } from "../../lib/api";
import type { BookmarkedQuestion } from "./types";

export interface Bookmark {
  user_id: number;
  stable_id: string;
  created_at: string;
}

export interface BookmarkRemoved {
  removed: boolean;
}

export const getBookmarks = async (): Promise<BookmarkedQuestion[]> => {
  const userId = await getDevUserId();
  const { data } = await api.get<BookmarkedQuestion[]>(
    `/users/${userId}/bookmarks`,
  );
  return data;
};

export const addBookmark = async (stableId: string): Promise<Bookmark> => {
  const userId = await getDevUserId();
  const { data } = await api.post<Bookmark>(
    `/users/${userId}/bookmarks/${stableId}`,
  );
  return data;
};

export const removeBookmark = async (
  stableId: string,
): Promise<BookmarkRemoved> => {
  const userId = await getDevUserId();
  const { data } = await api.delete<BookmarkRemoved>(
    `/users/${userId}/bookmarks/${stableId}`,
  );
  return data;
};
