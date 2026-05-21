import { api } from "../../lib/api";
import { parseApiResponse } from "../../lib/validation";
import {
  AuthUserSchema,
  LoginResponseSchema,
  RefreshResponseSchema,
} from "./schemas";
import type {
  AuthUser,
  LoginRequest,
  LoginResponse,
  RefreshResponse,
  RegisterRequest,
} from "./types";

export const login = async (input: LoginRequest): Promise<LoginResponse> => {
  const { data } = await api.post<unknown>("/auth/login", input);
  return parseApiResponse(LoginResponseSchema, data, "login");
};

export const register = async (
  input: RegisterRequest,
): Promise<LoginResponse> => {
  const { data } = await api.post<unknown>("/auth/register", input);
  return parseApiResponse(LoginResponseSchema, data, "register");
};

export const refresh = async (): Promise<RefreshResponse> => {
  const { data } = await api.post<unknown>("/auth/refresh");
  return parseApiResponse(RefreshResponseSchema, data, "refresh");
};

export const getMe = async (): Promise<AuthUser> => {
  const { data } = await api.get<unknown>("/auth/me");
  return parseApiResponse(AuthUserSchema, data, "getMe");
};

export const logout = async (): Promise<void> => {
  await api.post("/auth/logout");
};
