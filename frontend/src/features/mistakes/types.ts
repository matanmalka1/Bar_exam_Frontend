import type { z } from "zod";
import type { MistakeItemSchema } from "./schemas";

export type MistakeItem = z.infer<typeof MistakeItemSchema>;
