import axios from "axios";
import { useState, type SyntheticEvent } from "react";
import { Lock, Mail } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Alert from "../../components/Alert";
import AppLoader from "../../components/loader";
import Button from "../../components/Button";
import PasswordToggle from "../../components/PasswordToggle";
import { notifyApiError, notifyError } from "../../lib/toast";
import AuthPageShell from "./components/AuthPageShell";
import AuthTextField from "./components/AuthTextField";
import { LoginRequestSchema } from "./schemas";
import { useAuth } from "./useAuth";

type LoginFieldErrors = {
  email?: string;
  password?: string;
};

const LoginPage = () => {
  const { status, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [suggestRegister, setSuggestRegister] = useState(false);
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
        setSuggestRegister(true);
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
    setSuggestRegister(false);
  };

  const updatePassword = (value: string) => {
    setPassword(value);
    setFieldErrors((e) => ({ ...e, password: undefined }));
    setError(null);
    setSuggestRegister(false);
  };

  return (
    <AuthPageShell
      eyebrow="ברוכים הבאים"
      title="התחברות"
      description="התחבר כדי להמשיך לתרגול, סימולציות ומעקב אחרי ההתקדמות שלך."
      footer={
        <footer className="mt-auto flex flex-col items-center gap-4 pt-10 pb-6">
          <div className="flex items-center gap-2 opacity-40">
            <div className="h-px w-8 bg-[var(--ink)]" />
            <span className="text-[11px] font-medium tracking-widest text-[var(--ink)]">
              המשימה - הכנה לבחינות הלשכה
            </span>
            <div className="h-px w-8 bg-[var(--ink)]" />
          </div>
        </footer>
      }
    >
        <form
          noValidate
          onSubmit={onSubmit}
          className="flex flex-grow flex-col gap-4"
        >
          {sessionExpired && (
            <Alert variant="info">ההתחברות פגה. אנא התחבר מחדש.</Alert>
          )}

          <AuthTextField
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
            error={fieldErrors.email}
          />

          <AuthTextField
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
              className={`flex h-14 w-full items-center justify-center rounded-2xl border text-sm font-semibold transition active:scale-95 ${
                suggestRegister
                  ? "border-black bg-black/5 text-[var(--ink)] ring-2 ring-black/20"
                  : "border-[var(--ink)]/10 bg-transparent text-[var(--ink)] hover:bg-[var(--ink)]/5"
              }`}
            >
              {suggestRegister ? "עדיין לא רשום? לחץ כאן להרשמה" : "עדיין אין לך חשבון? הרשמה"}
            </Link>
          </div>
        </form>
    </AuthPageShell>
  );
};

export default LoginPage;
