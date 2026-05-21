import type { z } from "zod";
import type {
  AuthUserSchema,
  LoginRequestSchema,
  LoginResponseSchema,
  RefreshResponseSchema,
  RegisterRequestSchema,
} from "./schemas";

export type AuthUser = z.infer<typeof AuthUserSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type RefreshResponse = z.infer<typeof RefreshResponseSchema>;

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";
