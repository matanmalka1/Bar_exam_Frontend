import { api, getCurrentUserId } from "../../lib/api";
import type { MistakeItem } from "./types";

export const getMistakes = async (): Promise<MistakeItem[]> => {
  const userId = getCurrentUserId();
  const { data } = await api.get<MistakeItem[]>(`/users/${userId}/mistakes`);
  return data;
};
