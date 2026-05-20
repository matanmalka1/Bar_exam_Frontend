import { api } from "../../lib/api";
import type { AuthUser, LoginRequest, LoginResponse } from "./types";

export const login = async (input: LoginRequest): Promise<LoginResponse> => {
  const { data } = await api.post<LoginResponse>("/auth/login", input);
  return data;
};

export const getMe = async (): Promise<AuthUser> => {
  const { data } = await api.get<AuthUser>("/auth/me");
  return data;
};

export const logout = async (): Promise<void> => {
  await api.post("/auth/logout");
};
