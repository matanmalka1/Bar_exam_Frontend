import { api, DEV_USER_ID } from "../../lib/api";
import type { BookmarkedQuestion } from "./types";

export const getBookmarks = async (): Promise<BookmarkedQuestion[]> => {
  const { data } = await api.get<BookmarkedQuestion[]>(
    `/users/${DEV_USER_ID}/bookmarks`,
  );
  return data;
};

export const addBookmark = async (stableId: string) => {
  const { data } = await api.post(`/users/${DEV_USER_ID}/bookmarks`, {
    stable_id: stableId,
  });
  return data as unknown;
};

export const removeBookmark = async (stableId: string) => {
  const { data } = await api.delete(
    `/users/${DEV_USER_ID}/bookmarks/${stableId}`,
  );
  return data as unknown;
};
