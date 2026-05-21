import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
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

const AUTH_FREE_PATHS = new Set([
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/auth/logout",
]);

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
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

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<string> | null = null;

const requestNewAccessToken = async (): Promise<string> => {
  const res = await axios.post<{ access_token: string }>(
    `${API_BASE_URL}/auth/refresh`,
    {},
    { withCredentials: true },
  );
  return res.data.access_token;
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
    if (!axios.isAxiosError(err) || !err.config || err.response?.status !== 401) {
      return Promise.reject(err);
    }
    const config = err.config as RetriableConfig;
    const url = config.url ?? "";
    if (AUTH_FREE_PATHS.has(url) || config._retry) {
      if (url !== "/auth/login" && url !== "/auth/register") {
        clearAccessToken();
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
      clearAccessToken();
      on401?.();
      return Promise.reject(refreshErr instanceof AxiosError ? refreshErr : err);
    }
  },
);

export const isApiStatusError = (err: unknown, status: number): boolean =>
  axios.isAxiosError(err) && err.response?.status === status;

export const getApiErrorDetail = (err: unknown): unknown => {
  if (!axios.isAxiosError(err)) return null;
  return (err.response?.data as { detail?: unknown } | undefined)?.detail;
};
