import { api, getDevUserId } from "../../lib/api";
import type { MistakeItem } from "./types";

export const getMistakes = async (): Promise<MistakeItem[]> => {
  const userId = await getDevUserId();
  const { data } = await api.get<MistakeItem[]>(`/users/${userId}/mistakes`);
  return data;
};
