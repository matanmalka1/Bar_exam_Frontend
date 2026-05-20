import axios from "axios";
import {
  clearAccessToken,
  getAccessToken,
} from "../features/auth/authStorage";

interface RuntimeImportMeta {
  readonly env?: {
    readonly VITE_API_BASE_URL?: string;
  };
}

const API_BASE_URL =
  (import.meta as RuntimeImportMeta).env?.VITE_API_BASE_URL ??
  "http://localhost:8000/api/v1";

export const HTTP_UNPROCESSABLE = 422;

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization =
      `Bearer ${token}`;
  }
  return config;
});

let on401: (() => void) | null = null;

export const setOnUnauthorized = (handler: (() => void) | null): void => {
  on401 = handler;
};

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (
      axios.isAxiosError(err) &&
      err.response?.status === 401 &&
      err.config?.url !== "/auth/login"
    ) {
      clearAccessToken();
      on401?.();
    }
    return Promise.reject(err);
  },
);

export const isApiStatusError = (err: unknown, status: number): boolean =>
  axios.isAxiosError(err) && err.response?.status === status;

export const getApiErrorDetail = (err: unknown): unknown => {
  if (!axios.isAxiosError(err)) return null;
  return (err.response?.data as { detail?: unknown } | undefined)?.detail;
};
