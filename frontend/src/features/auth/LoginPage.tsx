import axios from "axios";
import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import AppLoader from "../../components/loader";
import { LoginRequestSchema } from "./schemas";
import { useAuth } from "./useAuth";

const inputClass =
  "focus-ring w-full rounded-2xl border border-default bg-white/90 px-4 py-3 text-base text-primary shadow-inner placeholder:text-black/45 outline-none transition focus:bg-white disabled:opacity-45";

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
              התחברות
            </h1>
            <p className="mt-2 text-sm leading-6 text-secondary">
              הזן אימייל וסיסמה כדי להמשיך לתרגול.
            </p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="login-email"
                  className="block text-xs font-semibold uppercase tracking-wide text-secondary"
                >
                  אימייל
                </label>
                <input
                  id="login-email"
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
                  htmlFor="login-password"
                  className="block text-xs font-semibold uppercase tracking-wide text-secondary"
                >
                  סיסמה
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputClass} pl-14`}
                    disabled={submitting}
                    placeholder="••••••••"
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

              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-secondary hover:text-primary"
                >
                  שכחת סיסמה?
                </Link>
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-2xl border-2 border-strong bg-white px-3 py-2 text-sm font-semibold text-primary"
                >
                  {error}
                </div>
              )}

              <Button
                type="submit"
                fullWidth
                disabled={submitting || !email || !password}
                className="mt-2 shadow-lg shadow-black/10"
              >
                {submitting ? (
                  <AppLoader variant="button" label="מתחבר..." />
                ) : (
                  "התחברות"
                )}
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-secondary">
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

        <p className="mt-5 text-center text-xs text-secondary">
          תרגול בחינות לשכת עורכי הדין
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
