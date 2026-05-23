import axios from "axios";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Alert from "../../components/Alert";
import AppHeader from "../../components/AppHeader";
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
      nextFieldErrors.email = "יש להזין אימייל";
      nextFieldErrors.password = "יש להזין סיסמה";
      setFieldErrors(nextFieldErrors);
      setError("יש להזין אימייל וסיסמה");
      return false;
    }

    const result = LoginRequestSchema.safeParse({
      email: trimmedEmail,
      password,
    });

    if (result.success) {
      setFieldErrors({});
      return true;
    }

    result.error.issues.forEach((issue) => {
      const field = issue.path[0];
      if (field === "email" && !nextFieldErrors.email) {
        nextFieldErrors.email = trimmedEmail
          ? issue.message
          : "יש להזין אימייל";
      }
      if (field === "password" && !nextFieldErrors.password) {
        nextFieldErrors.password = password ? issue.message : "יש להזין סיסמה";
      }
    });

    setFieldErrors(nextFieldErrors);
    setError(result.error.issues[0]?.message ?? "נתונים לא תקינים");
    return false;
  };

  const onSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    if (!validate()) {
      return;
    }
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
    setFieldErrors((errors) => ({ ...errors, email: undefined }));
    setError(null);
  };

  const updatePassword = (value: string) => {
    setPassword(value);
    setFieldErrors((errors) => ({ ...errors, password: undefined }));
    setError(null);
  };

return (
  <div
    dir="rtl"
    className="relative min-h-svh overflow-hidden bg-[var(--paper)] text-[var(--ink)]"
  >
    <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[var(--accent)]/10 blur-3xl" />
    <div className="pointer-events-none absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-black/5 blur-3xl" />

    <div className="relative mx-auto flex min-h-svh w-full max-w-[430px] flex-col px-6 pb-8 pt-10">
      <main className="flex flex-1 items-center">
        <div className="w-full">
          <div className="mb-8">
            <div className="mb-5 h-1.5 w-14 rounded-full bg-[var(--accent-ink)]" />

            <AppHeader
              back={false}
              eyebrow="התחברות"
              eyebrowClassName="text-lg font-bold tracking-normal text-primary"
              title="ברוך הבא"
              titleLayout="stacked"
              variant="inline"
            />

            <p className="mt-3 max-w-[320px] text-sm leading-6 text-secondary">
              התחבר כדי להמשיך לתרגול, סימולציות ומעקב אחרי ההתקדמות שלך.
            </p>
          </div>

          <form
            noValidate
            onSubmit={onSubmit}
            className="flex flex-col gap-4"
          >
            {sessionExpired && (
              <Alert variant="info">
                ההתחברות פגה. אנא התחבר מחדש.
              </Alert>
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
              placeholder="name@example.com"
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

            <div className="-mt-1 flex justify-end">
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-secondary transition hover:text-[var(--ink)]"
              >
                שכחת סיסמה?
              </Link>
            </div>

            {error && <Alert variant="error">{error}</Alert>}

            <Button
              type="submit"
              fullWidth
              disabled={submitting}
              className="mt-3 h-12 rounded-2xl text-base font-bold shadow-sm"
            >
              {submitting ? (
                <AppLoader variant="button" label="מתחבר..." />
              ) : (
                "התחברות"
              )}
            </Button>
          </form>
        </div>
      </main>

      <div className="mt-8 border-t border-[var(--border)] pt-5 text-center">
        <p className="text-sm text-secondary">
          אין לך חשבון?{" "}
          <Link
            to="/register"
            className="font-bold text-[var(--accent-ink)] underline underline-offset-4"
          >
            הרשמה
          </Link>
        </p>
      </div>
    </div>
  </div>
);
};

export default LoginPage;
