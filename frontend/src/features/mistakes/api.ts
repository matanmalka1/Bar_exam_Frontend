import { api, DEV_USER_ID } from "../../lib/api";
import type { MistakeItem } from "./types";

export const getMistakes = async (): Promise<MistakeItem[]> => {
  const { data } = await api.get<MistakeItem[]>(
    `/users/${DEV_USER_ID}/mistakes`,
  );
  return data;
};
