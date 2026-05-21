import type { z } from "zod";
import type {
  AuthUserSchema,
  ForgotPasswordResponseSchema,
  LoginRequestSchema,
  LoginResponseSchema,
  RefreshResponseSchema,
  RegisterRequestSchema,
  ResetPasswordResponseSchema,
} from "./schemas";

export type AuthUser = z.infer<typeof AuthUserSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type RefreshResponse = z.infer<typeof RefreshResponseSchema>;
export type ForgotPasswordResponse = z.infer<typeof ForgotPasswordResponseSchema>;
export type ResetPasswordResponse = z.infer<typeof ResetPasswordResponseSchema>;

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";
