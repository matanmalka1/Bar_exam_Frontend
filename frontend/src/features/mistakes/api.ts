import { api } from "../../lib/api";
import type { MistakeItem } from "./types";

export const getMistakes = async (): Promise<MistakeItem[]> => {
  const { data } = await api.get<MistakeItem[]>("/users/me/mistakes");
  return data;
};
