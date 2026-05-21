import axios from "axios";
import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Alert from "../../components/Alert";
import Button from "../../components/Button";
import AppLoader from "../../components/loader";
import { getApiErrorDetail, isApiStatusError } from "../../lib/api";
import { RegisterFormSchema } from "./schemas";
import type { RegisterRequest } from "./types";
import { useAuth } from "./useAuth";

const inputClass =
  "focus-ring w-full rounded-2xl border border-default bg-white/90 px-4 py-3 text-base text-primary shadow-inner placeholder:text-black/45 outline-none transition focus:bg-white disabled:opacity-45";

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
    <div
      dir="rtl"
      className="relative min-h-screen overflow-hidden bg-[var(--paper)] text-[var(--ink)]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-white opacity-50 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-white opacity-50 blur-3xl"
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[460px] flex-col justify-center p-5">
        <div className="surface-muted relative overflow-hidden rounded-[2rem] border border-default p-7 shadow-[var(--shadow-elevated)]">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-12 -top-12 h-36 w-36 rounded-full bg-white/50 blur-2xl"
          />
          <div className="relative">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-[var(--accent)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              ברוך הבא
            </p>
            <h1 className="font-display mt-3 text-[2.2rem] font-black leading-[1.05] text-[var(--accent-ink)]">
              הרשמה
            </h1>
            <p className="mt-2 text-sm leading-6 text-secondary">
              צור חשבון חדש כדי להתחיל לתרגל.
            </p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="reg-name"
                  className="block text-xs font-semibold uppercase tracking-wide text-secondary"
                >
                  שם מלא
                </label>
                <input
                  id="reg-name"
                  type="text"
                  autoComplete="name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={inputClass}
                  disabled={submitting}
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="reg-email"
                  className="block text-xs font-semibold uppercase tracking-wide text-secondary"
                >
                  אימייל
                </label>
                <input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  dir="ltr"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`${inputClass} text-right`}
                  disabled={submitting}
                  placeholder="name@example.com"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="reg-password"
                  className="block text-xs font-semibold uppercase tracking-wide text-secondary"
                >
                  סיסמה
                </label>
                <div className="relative">
                  <input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputClass} pl-14`}
                    disabled={submitting}
                    placeholder="לפחות 8 תווים"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "הסתר סיסמה" : "הצג סיסמה"}
                    aria-pressed={showPassword}
                    className="absolute inset-y-0 left-2 my-auto h-8 rounded-xl px-2 text-xs font-semibold text-secondary hover:text-primary disabled:opacity-45"
                    disabled={submitting}
                  >
                    {showPassword ? "הסתר" : "הצג"}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="reg-confirm"
                  className="block text-xs font-semibold uppercase tracking-wide text-secondary"
                >
                  אימות סיסמה
                </label>
                <input
                  id="reg-confirm"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className={inputClass}
                  disabled={submitting}
                />
              </div>

              {error && <Alert variant="error">{error}</Alert>}

              <Button
                type="submit"
                fullWidth
                disabled={
                  submitting || !fullName || !email || !password || !confirm
                }
                className="mt-2 shadow-lg shadow-black/10"
              >
                {submitting ? (
                  <AppLoader variant="button" label="נרשם..." />
                ) : (
                  "הרשמה"
                )}
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-secondary">
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
      </div>
    </div>
  );
};

export default RegisterPage;
