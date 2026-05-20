import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

export const HTTP_UNPROCESSABLE = 422;

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

export const isApiStatusError = (err: unknown, status: number): boolean =>
  axios.isAxiosError(err) && err.response?.status === status;

export const getApiErrorDetail = (err: unknown): unknown => {
  if (!axios.isAxiosError(err)) return null;
  return (err.response?.data as { detail?: unknown } | undefined)?.detail;
};

interface DevUser {
  id: number;
  display_name: string;
  user_key: string | null;
  created_at: string;
}

let devUserPromise: Promise<DevUser> | null = null;

// Dev-only user. Replace with real auth later.
export const getDevUserId = async (): Promise<number> => {
  devUserPromise ??= api.post<DevUser>("/users/dev").then(({ data }) => data);
  const user = await devUserPromise;
  return user.id;
};
