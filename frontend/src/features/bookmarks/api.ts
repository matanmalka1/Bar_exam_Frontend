import { api, DEV_USER_ID } from "../../lib/api";
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
  const { data } = await api.get<BookmarkedQuestion[]>(
    `/users/${DEV_USER_ID}/bookmarks`,
  );
  return data;
};

export const addBookmark = async (stableId: string): Promise<Bookmark> => {
  const { data } = await api.post<Bookmark>(
    `/users/${DEV_USER_ID}/bookmarks/${stableId}`,
  );
  return data;
};

export const removeBookmark = async (
  stableId: string,
): Promise<BookmarkRemoved> => {
  const { data } = await api.delete<BookmarkRemoved>(
    `/users/${DEV_USER_ID}/bookmarks/${stableId}`,
  );
  return data;
};
