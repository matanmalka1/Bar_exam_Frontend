import { api } from "../../lib/api";
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
  const { data } = await api.get<BookmarkedQuestion[]>("/users/me/bookmarks");
  return data;
};

export const addBookmark = async (stableId: string): Promise<Bookmark> => {
  const { data } = await api.post<Bookmark>(
    `/users/me/bookmarks/${stableId}`,
  );
  return data;
};

export const removeBookmark = async (
  stableId: string,
): Promise<BookmarkRemoved> => {
  const { data } = await api.delete<BookmarkRemoved>(
    `/users/me/bookmarks/${stableId}`,
  );
  return data;
};
