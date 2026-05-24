import { api } from "../../lib/api";
import { parseApiResponse } from "../../lib/validation";
import { MistakeItemSchema } from "./schemas";
import type { MistakeItem } from "./types";

export const getMistakes = async (): Promise<MistakeItem[]> => {
  const { data } = await api.get<unknown>("/users/me/mistakes");
  return parseApiResponse(MistakeItemSchema.array(), data, "getMistakes");
};
