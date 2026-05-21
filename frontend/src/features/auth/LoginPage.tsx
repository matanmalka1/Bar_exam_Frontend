import axios from "axios";
import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Alert from "../../components/Alert";
import AppHeader from "../../components/AppHeader";
import AppLoader from "../../components/loader";
import Button from "../../components/Button";
import PasswordToggle from "../../components/PasswordToggle";
import TextField from "../../components/TextField";
import { LoginRequestSchema } from "./schemas";
import { useAuth } from "./useAuth";

const LoginPage = () => {
  const { status, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (status === "authenticated") return <Navigate to="/" replace />;

  const validate = (): string | null => {
    const result = LoginRequestSchema.safeParse({ email, password });
    if (result.success) return null;
    return result.error.issues[0]?.message ?? "נתונים לא תקינים";
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const localErr = validate();
    if (localErr) {
      setError(localErr);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError("פרטי ההתחברות שגויים");
      } else {
        setError("החיבור נכשל. נסה שוב");
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
          eyebrow="התחברות"
          title="ברוך הבא"
          variant="inline"
        />

        <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-4">
          <TextField
            id="login-email"
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
            id="login-password"
            label="סיסמה"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
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
            disabled={submitting || !email || !password}
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
