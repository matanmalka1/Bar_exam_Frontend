import axios, {
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import {
  clearTokens,
  getAccessToken,
  setAccessToken,
} from "../features/auth/authStorage";

interface RuntimeImportMeta {
  readonly env?: {
    readonly VITE_API_BASE_URL?: string;
  };
}

const API_BASE_URL =
  (import.meta as RuntimeImportMeta).env?.VITE_API_BASE_URL ?? "/api/v1";

export const HTTP_UNPROCESSABLE = 422;

const AUTH_FREE_PATHS = new Set([
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/auth/logout",
]);

const isAuthFreePath = (url: string): boolean => {
  const [path] = url.split("?");
  return AUTH_FREE_PATHS.has(path);
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  const url = config.url ?? "";
  if (token && !isAuthFreePath(url)) {
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

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<string> | null = null;

const requestNewAccessToken = async (): Promise<string> => {
  const res = await api.post<{ access_token: string }>("/auth/refresh");
  return (res.data as { access_token: string }).access_token;
};

const refreshAccessToken = (): Promise<string> => {
  if (!refreshPromise) {
    refreshPromise = requestNewAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

api.interceptors.response.use(
  (res) => res,
  async (err: unknown) => {
    if (
      !axios.isAxiosError(err) ||
      !err.config ||
      err.response?.status !== 401
    ) {
      return Promise.reject(err);
    }
    const config = err.config as RetriableConfig;
    const url = config.url ?? "";
    if (isAuthFreePath(url) || config._retry) {
      if (url !== "/auth/login" && url !== "/auth/register") {
        clearTokens();
        on401?.();
      }
      return Promise.reject(err);
    }
    try {
      const token = await refreshAccessToken();
      setAccessToken(token);
      config._retry = true;
      config.headers = config.headers ?? {};
      (config.headers as Record<string, string>).Authorization =
        `Bearer ${token}`;
      return api.request(config as AxiosRequestConfig);
    } catch (refreshErr) {
      clearTokens();
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem("auth_expired", "1");
      }
      on401?.();
      return Promise.reject(refreshErr);
    }
  },
);

export const isApiStatusError = (err: unknown, status: number): boolean =>
  axios.isAxiosError(err) && err.response?.status === status;

type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const getApiErrorEnvelope = (
  err: unknown,
): ApiErrorResponse["error"] | null => {
  if (!axios.isAxiosError(err)) return null;
  const data = err.response?.data;
  if (!isRecord(data) || !isRecord(data.error)) return null;
  const { code, message, details } = data.error;
  if (typeof code !== "string" || typeof message !== "string") return null;
  return { code, message, details };
};

export const getApiErrorMessage = (err: unknown): string | null =>
  getApiErrorEnvelope(err)?.message ?? null;

export const getApiErrorDetail = (err: unknown): unknown => {
  if (!axios.isAxiosError(err)) return null;
  const envelope = getApiErrorEnvelope(err);
  if (envelope) return envelope.details ?? envelope.message;
  return (err.response?.data as { detail?: unknown } | undefined)?.detail;
};
