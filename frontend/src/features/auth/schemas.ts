import { z } from "zod";

export const AuthUserSchema = z.object({
  id: z.number().int(),
  full_name: z.string(),
  email: z.string().email(),
  is_active: z.boolean(),
});

export const LoginRequestSchema = z.object({
  email: z.string().email("אימייל לא תקין"),
  password: z.string().min(1, "סיסמה היא שדה חובה").max(128),
});

const passwordSchema = z
  .string()
  .min(8, "הסיסמה חייבת להכיל לפחות 8 תווים")
  .max(128)
  .refine((v) => /[A-Z]/.test(v), "הסיסמה חייבת להכיל לפחות אות גדולה אחת")
  .refine((v) => /[a-z]/.test(v), "הסיסמה חייבת להכיל לפחות אות קטנה אחת")
  .refine((v) => /[^a-zA-Z0-9]/.test(v), "הסיסמה חייבת להכיל לפחות תו מיוחד אחד");

export const RegisterRequestSchema = z.object({
  full_name: z.string().trim().min(1, "שם מלא הוא שדה חובה").max(20),
  email: z.string().email("אימייל לא תקין"),
  password: passwordSchema,
});

export const RegisterFormSchema = RegisterRequestSchema.extend({
  confirm: z.string(),
}).refine((data) => data.password === data.confirm, {
  path: ["confirm"],
  message: "הסיסמאות אינן תואמות",
});

export const LoginResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.literal("bearer"),
  user: AuthUserSchema,
});

export const RefreshResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.literal("bearer"),
});
