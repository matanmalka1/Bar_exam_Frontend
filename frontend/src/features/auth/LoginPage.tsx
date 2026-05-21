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
    <div dir="rtl" className="min-h-svh bg-[var(--paper)] text-[var(--ink)]">
      <div className="mx-auto flex min-h-svh w-full max-w-[480px] flex-col px-5 pb-8 pt-6">
        <AppHeader
          back={false}
          eyebrow="התחברות"
          title="ברוך הבא"
          variant="inline"
        />

        <form
          noValidate
          onSubmit={onSubmit}
          className="flex flex-1 flex-col gap-4"
        >
          {sessionExpired && (
            <Alert variant="info" className="mb-0">
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
            className="text-right"
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
            endSlot={
              <PasswordToggle
                visible={showPassword}
                onToggle={() => setShowPassword((v) => !v)}
                disabled={submitting}
              />
            }
          />

          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-secondary hover:text-primary"
            >
              שכחת סיסמה?
            </Link>
          </div>

          {error && <Alert variant="error">{error}</Alert>}

          <Button
            type="submit"
            fullWidth
            disabled={submitting}
            className="mt-2"
          >
            {submitting ? (
              <AppLoader variant="button" label="מתחבר..." />
            ) : (
              "התחברות"
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-secondary">
          אין לך חשבון?{" "}
          <Link
            to="/register"
            className="font-semibold text-[var(--accent-ink)] underline"
          >
            הרשמה
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
