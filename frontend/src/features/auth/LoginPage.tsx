import axios from "axios";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Alert from "../../components/Alert";
import AppLoader from "../../components/loader";
import Button from "../../components/Button";
import PasswordToggle from "../../components/PasswordToggle";
import TextField from "../../components/TextField";
import { notifyApiError, notifyError } from "../../lib/toast";
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

  const onSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
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
    <div dir="rtl" className="relative min-h-svh overflow-hidden bg-[var(--paper)] text-[var(--ink)]">
      <div className="mx-auto flex min-h-svh w-full max-w-[430px] flex-col px-6 pb-8">
        <header className="flex flex-col items-start gap-1 pb-8 pt-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-secondary">
            ברוכים הבאים
          </span>
          <h1
            className="text-[32px] font-black leading-none text-[var(--ink)]"
            style={{ fontFamily: "'Frank Ruhl Libre', serif" }}
          >
            התחברות
          </h1>
          <div className="mt-4 h-1 w-12 rounded-full bg-[var(--ink)]" />
          <p className="mt-6 text-sm leading-relaxed text-secondary">
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

          <TextField
            id="login-email"
            label="אימייל"
            type="email"
            autoComplete="email"
            inputMode="email"
            dir="ltr"
            required
            value={email}
            onChange={(e) => updateEmail(e.target.value)}
            disabled={submitting}
            placeholder="your@email.com"
            className="text-left"
            error={fieldErrors.email}
          />

          <TextField
            id="login-password"
            label="סיסמה"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => updatePassword(e.target.value)}
            disabled={submitting}
            placeholder="••••••••"
            error={fieldErrors.password}
            endSlotPlacement="end"
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

          {error && <Alert variant="error">{error}</Alert>}

          <div className="mt-6 flex flex-col gap-4">
            <Button
              type="submit"
              fullWidth
              disabled={submitting}
              className="h-14 rounded-2xl text-base font-bold shadow-sm"
            >
              {submitting ? (
                <AppLoader variant="button" label="מתחבר..." />
              ) : (
                "התחברות"
              )}
            </Button>

            <Link
              to="/register"
              className="flex h-14 w-full items-center justify-center rounded-2xl border border-[var(--ink)]/10 bg-transparent text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--ink)]/5"
            >
              עדיין אין לך חשבון? הרשמה
            </Link>
          </div>
        </form>

        <footer className="flex flex-col items-center gap-4 py-8">
          <div className="flex items-center gap-2 opacity-40">
            <div className="h-px w-8 bg-[var(--ink)]" />
            <span className="text-[11px] font-medium tracking-widest text-[var(--ink)]">
              המשימה - הכנה לבחינות הלשכה
            </span>
            <div className="h-px w-8 bg-[var(--ink)]" />
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LoginPage;
