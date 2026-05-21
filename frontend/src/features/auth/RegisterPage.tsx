import axios from "axios";
import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Alert from "../../components/Alert";
import AppHeader from "../../components/AppHeader";
import AppLoader from "../../components/loader";
import Button from "../../components/Button";
import PasswordToggle from "../../components/PasswordToggle";
import TextField from "../../components/TextField";
import { getApiErrorDetail, isApiStatusError } from "../../lib/api";
import { RegisterFormSchema } from "./schemas";
import type { RegisterRequest } from "./types";
import { useAuth } from "./useAuth";

const RegisterPage = () => {
  const { status, register } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (status === "authenticated") return <Navigate to="/" replace />;

  const validate = ():
    | { ok: true; data: RegisterRequest }
    | { ok: false; error: string } => {
    const result = RegisterFormSchema.safeParse({
      full_name: fullName,
      email,
      password,
      confirm,
    });
    if (!result.success) {
      return {
        ok: false,
        error: result.error.issues[0]?.message ?? "נתונים לא תקינים",
      };
    }
    return {
      ok: true,
      data: {
        full_name: result.data.full_name,
        email: result.data.email,
        password: result.data.password,
      },
    };
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const validation = validate();
    if (!validation.ok) {
      setError(validation.error);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await register(validation.data);
      navigate("/", { replace: true });
    } catch (err) {
      if (isApiStatusError(err, 409)) {
        setError("כבר קיים משתמש עם האימייל הזה");
      } else if (isApiStatusError(err, 422)) {
        setError("נתונים לא תקינים. בדוק שוב את הפרטים");
      } else if (axios.isAxiosError(err) && err.response) {
        const detail = getApiErrorDetail(err);
        setError(typeof detail === "string" ? detail : "ההרשמה נכשלה");
      } else {
        setError("ההרשמה נכשלה. נסה שוב");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-svh bg-[var(--paper)] text-[var(--ink)]">
      <div className="mx-auto flex min-h-svh w-full max-w-[480px] flex-col px-5 pb-8 pt-6">
        <AppHeader
          back={false}
          eyebrow="הרשמה"
          title="צור חשבון"
          variant="inline"
        />

        <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-4">
          <TextField
            id="reg-name"
            label="שם מלא"
            type="text"
            autoComplete="name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={submitting}
          />

          <TextField
            id="reg-email"
            label="אימייל"
            type="email"
            autoComplete="email"
            inputMode="email"
            dir="ltr"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitting}
            placeholder="name@example.com"
            className="text-right"
          />

          <TextField
            id="reg-password"
            label="סיסמה"
            hint="לפחות 8 תווים"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={submitting}
            placeholder="••••••••"
            endSlot={
              <PasswordToggle
                visible={showPassword}
                onToggle={() => setShowPassword((v) => !v)}
                disabled={submitting}
              />
            }
          />

          <TextField
            id="reg-confirm"
            label="אימות סיסמה"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            disabled={submitting}
            placeholder="••••••••"
          />

          {error && <Alert variant="error">{error}</Alert>}

          <Button
            type="submit"
            fullWidth
            disabled={submitting || !fullName || !email || !password || !confirm}
            className="mt-2"
          >
            {submitting ? (
              <AppLoader variant="button" label="נרשם..." />
            ) : (
              "הרשמה"
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-secondary">
          כבר יש לך חשבון?{" "}
          <Link
            to="/login"
            className="font-semibold text-[var(--accent-ink)] underline"
          >
            התחברות
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
