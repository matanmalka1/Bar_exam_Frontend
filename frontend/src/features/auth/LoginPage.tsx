import axios from "axios";
import {
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type SyntheticEvent,
} from "react";
import { Lock, Mail } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Alert from "../../components/Alert";
import AppLoader from "../../components/loader";
import Button from "../../components/Button";
import PasswordToggle from "../../components/PasswordToggle";
import { notifyApiError, notifyError } from "../../lib/toast";
import { LoginRequestSchema } from "./schemas";
import { useAuth } from "./useAuth";

type LoginFieldErrors = {
  email?: string;
  password?: string;
};

type LoginFieldProps = {
  id: string;
  label: string;
  icon: ReactNode;
  error?: string;
  endSlot?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>;

const LoginField = ({
  id,
  label,
  icon,
  error,
  endSlot,
  className = "",
  ...inputProps
}: LoginFieldProps) => (
  <div className="flex flex-col gap-1">
    <label
      htmlFor={id}
      className="pe-2 text-sm font-semibold leading-none text-secondary"
    >
      {label}
    </label>
    <div className="group relative">
      <input
        id={id}
        aria-invalid={!!error || undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`h-12 w-full rounded-2xl border bg-white px-12 py-3 text-base text-[var(--ink)] outline-none transition duration-200 placeholder:text-black/35 focus:border-[var(--ink)] focus:ring-0 disabled:opacity-45 ${
          error ? "border-[var(--border-strong)]" : "border-[var(--border-default)]"
        } ${className}`}
        {...inputProps}
      />
      <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-black/35 transition-colors group-focus-within:text-[var(--ink)]">
        {icon}
      </span>
      {endSlot && (
        <span className="absolute inset-y-0 left-3 flex items-center">
          {endSlot}
        </span>
      )}
    </div>
    {error && (
      <p id={`${id}-error`} className="text-xs font-semibold text-primary">
        {error}
      </p>
    )}
  </div>
);

const LoginPage = () => {
  const { status, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [sessionExpired] = useState(() => {
    if (typeof sessionStorage === "undefined") return false;
    const flag = sessionStorage.getItem("auth_expired") === "1";
    if (flag) sessionStorage.removeItem("auth_expired");
    return flag;
  });

  if (status === "authenticated") return <Navigate to="/" replace />;

  const validate = (): boolean => {
    const nextFieldErrors: LoginFieldErrors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail && !password) {
      setFieldErrors({ email: "יש להזין אימייל", password: "יש להזין סיסמה" });
      setError("יש להזין אימייל וסיסמה");
      return false;
    }

    const result = LoginRequestSchema.safeParse({ email: trimmedEmail, password });

    if (result.success) {
      setFieldErrors({});
      return true;
    }

    result.error.issues.forEach((issue) => {
      const field = issue.path[0];
      if (field === "email" && !nextFieldErrors.email)
        nextFieldErrors.email = trimmedEmail ? issue.message : "יש להזין אימייל";
      if (field === "password" && !nextFieldErrors.password)
        nextFieldErrors.password = password ? issue.message : "יש להזין סיסמה";
    });

    setFieldErrors(nextFieldErrors);
    setError(result.error.issues[0]?.message ?? "נתונים לא תקינים");
    return false;
  };

  const onSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting || !validate()) return;
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate("/", { replace: true });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        notifyError("פרטי ההתחברות שגויים");
      } else {
        notifyApiError(err, "החיבור נכשל. נסה שוב");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const updateEmail = (value: string) => {
    setEmail(value);
    setFieldErrors((e) => ({ ...e, email: undefined }));
    setError(null);
  };

  const updatePassword = (value: string) => {
    setPassword(value);
    setFieldErrors((e) => ({ ...e, password: undefined }));
    setError(null);
  };

  return (
    <div
      dir="rtl"
      className="relative min-h-svh overflow-hidden bg-[var(--paper)] text-[var(--ink)]"
    >
      <div className="pointer-events-none fixed inset-0 opacity-[0.04] [background-image:radial-gradient(circle_at_1px_1px,#000_1px,transparent_0)] [background-size:18px_18px]" />
      <div className="pointer-events-none fixed bottom-[-5%] left-[-10%] z-0 h-[20%] w-[60%] rounded-full bg-white/30 blur-3xl" />

      <main className="relative z-10 mx-auto flex min-h-svh w-full max-w-[430px] flex-col px-5 py-6">
        <header className="mb-10 flex flex-col text-right">
          <span className="mb-1 text-[11px] font-medium uppercase leading-none tracking-[0.18em] text-secondary">
            ברוכים הבאים
          </span>
          <h1 className="font-display text-xl font-black leading-[1.3] text-[var(--ink)]">
            התחברות
          </h1>
          <p className="mt-3 text-sm leading-6 text-secondary">
            התחבר כדי להמשיך לתרגול, סימולציות ומעקב אחרי ההתקדמות שלך.
          </p>
        </header>

        <form
          noValidate
          onSubmit={onSubmit}
          className="flex flex-grow flex-col gap-4"
        >
          {sessionExpired && (
            <Alert variant="info">ההתחברות פגה. אנא התחבר מחדש.</Alert>
          )}

          <LoginField
            id="login-email"
            label="אימייל"
            icon={<Mail className="h-5 w-5" aria-hidden="true" />}
            type="email"
            autoComplete="email"
            inputMode="email"
            dir="ltr"
            required
            value={email}
            onChange={(e) => updateEmail(e.target.value)}
            disabled={submitting}
            placeholder="your@email.com"
            className="text-right placeholder:text-right"
            error={fieldErrors.email}
          />

          <LoginField
            id="login-password"
            label="סיסמה"
            icon={<Lock className="h-5 w-5" aria-hidden="true" />}
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => updatePassword(e.target.value)}
            disabled={submitting}
            placeholder="••••••••"
            error={fieldErrors.password}
            endSlot={
              <PasswordToggle
                visible={showPassword}
                onToggle={() => setShowPassword((v) => !v)}
                disabled={submitting}
              />
            }
          />

          <div className="-mt-1 flex justify-start">
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-secondary transition hover:text-[var(--ink)]"
            >
              שכחת סיסמה?
            </Link>
          </div>

          {error && (
            <Alert variant="error" className="bg-white/80">
              {error}
            </Alert>
          )}

          <div className="mt-6 flex flex-col gap-4">
            <Button
              type="submit"
              fullWidth
              disabled={submitting}
              className="h-14 rounded-2xl bg-black text-base font-bold text-white shadow-sm active:scale-95"
            >
              {submitting ? (
                <AppLoader variant="button" label="מתחבר..." />
              ) : (
                "התחברות"
              )}
            </Button>

            <Link
              to="/register"
              className="flex h-14 w-full items-center justify-center rounded-2xl border border-[var(--ink)]/10 bg-transparent text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--ink)]/5 active:scale-95"
            >
              עדיין אין לך חשבון? הרשמה
            </Link>
          </div>
        </form>

        <footer className="mt-auto flex flex-col items-center gap-4 pt-10 pb-6">
          <div className="flex items-center gap-2 opacity-40">
            <div className="h-px w-8 bg-[var(--ink)]" />
            <span className="text-[11px] font-medium tracking-widest text-[var(--ink)]">
              המשימה - הכנה לבחינות הלשכה
            </span>
            <div className="h-px w-8 bg-[var(--ink)]" />
          </div>
        </footer>
      </main>
    </div>
  );
};

export default LoginPage;
