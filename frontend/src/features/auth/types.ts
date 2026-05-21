export interface AuthUser {
  id: number;
  full_name: string;
  email: string;
  is_active: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: "bearer";
  user: AuthUser;
}

export interface RefreshResponse {
  access_token: string;
  token_type: "bearer";
}

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";
