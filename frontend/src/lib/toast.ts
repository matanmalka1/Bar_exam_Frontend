import axios from "axios";
import { toast } from "sonner";
import { getApiErrorDetail, getApiErrorMessage } from "./api";

const DEFAULT_ERROR = "אירעה שגיאה. נסה שוב";
const NETWORK_ERROR = "אין חיבור לשרת. נסה שוב";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const containsHebrew = (value: string): boolean => /[\u0590-\u05FF]/.test(value);

const isSafeBackendMessage = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0 && containsHebrew(value);

const messageForStatus = (status: number, fallback: string): string => {
  if (status === 401) return "ההתחברות פגה. התחבר מחדש";
  if (status === 403) return "אין לך הרשאה לבצע פעולה זו";
  if (status === 404) return "הנתון המבוקש לא נמצא";
  if (status === 422) return "הנתונים שהוזנו אינם תקינים";
  if (status === 429) return "יותר מדי ניסיונות. נסה שוב בעוד כמה דקות";
  if (status >= 500) return "תקלה בשרת. נסה שוב מאוחר יותר";
  return fallback;
};

const extractSafeDetail = (detail: unknown): string | null => {
  if (isSafeBackendMessage(detail)) return detail.trim();
  if (Array.isArray(detail) || isRecord(detail)) return null;
  return null;
};

export const notifySuccess = (message: string): void => {
  toast.success(message);
};

export const notifyError = (message: string): void => {
  toast.error(message);
};

export const notifyInfo = (message: string): void => {
  toast(message);
};

export const notifyApiError = (
  error: unknown,
  fallback = DEFAULT_ERROR,
): void => {
  if (!axios.isAxiosError(error)) {
    const message =
      error instanceof Error && error.message.toLowerCase().includes("network")
        ? NETWORK_ERROR
        : fallback;
    notifyError(message);
    return;
  }

  if (!error.response) {
    notifyError(NETWORK_ERROR);
    return;
  }

  const detail = getApiErrorDetail(error);
  const message = getApiErrorMessage(error);
  const status = error.response.status;
  const safeDetail = extractSafeDetail(detail);

  if (safeDetail && status !== 422) {
    notifyError(safeDetail);
    return;
  }

  if (isSafeBackendMessage(message) && status !== 422) {
    notifyError(message.trim());
    return;
  }

  notifyError(messageForStatus(status, fallback));
};
