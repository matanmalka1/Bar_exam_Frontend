import axios from "axios";
import { MSG } from "./messages";

export const map422Detail = (detail: unknown): string | null => {
  const text = typeof detail === "string" ? detail : JSON.stringify(detail ?? "");
  const lower = text.toLowerCase();
  if (lower.includes("exam") && lower.includes("date")) return MSG.NEED_EXAM_DATE;
  if (lower.includes("exceed") || lower.includes("too many")) return MSG.COUNT_EXCEEDS;
  if (
    lower.includes("insufficient") ||
    lower.includes("not enough") ||
    lower.includes("no questions")
  )
    return MSG.INSUFFICIENT;
  return null;
};

export const extractApiError = (error: unknown, fallback?: string): string => {
  if (!axios.isAxiosError(error)) {
    if (error instanceof Error && error.message.toLowerCase().includes("timeout")) {
      return MSG.TIMEOUT;
    }
    if (error instanceof Error && error.message.toLowerCase().includes("network")) {
      return MSG.NETWORK;
    }
    return fallback ?? MSG.GENERIC;
  }

  if (!error.response) {
    if (error.code === "ECONNABORTED") return MSG.TIMEOUT;
    return MSG.NETWORK;
  }

  const status = error.response.status;

  if (status === 401) return MSG.UNAUTHORIZED;

  if (status === 422) {
    const detail = (error.response.data as { detail?: unknown } | undefined)?.detail;
    const mapped = map422Detail(detail);
    if (mapped) return mapped;
    if (typeof detail === "string" && detail.trim()) return detail;
    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0] as { msg?: string } | undefined;
      if (first?.msg) {
        const mappedFirst = map422Detail(first.msg);
        if (mappedFirst) return mappedFirst;
        return first.msg;
      }
    }
    return fallback ?? MSG.GENERIC;
  }

  return fallback ?? MSG.GENERIC;
};
