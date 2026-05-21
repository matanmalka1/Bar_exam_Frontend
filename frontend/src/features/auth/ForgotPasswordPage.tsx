import axios from "axios";
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/Button";
import AppLoader from "../../components/loader";
import { forgotPassword } from "./api";

const inputClass =
  "focus-ring w-full rounded-2xl border border-default bg-white/90 px-4 py-3 text-base text-primary shadow-inner placeholder:text-black/45 outline-none transition focus:bg-white disabled:opacity-45";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting || success) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await forgotPassword(email);
      setSuccess(res.message);
      setEmail("");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 422) {
        setError("אימייל לא תקין");
      } else {
        setError("שגיאה בשרת, נסה שוב");
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
              איפוס סיסמה
            </p>
            <h1 className="font-display mt-3 text-[2.2rem] font-black leading-[1.05] text-[var(--accent-ink)]">
              שכחת סיסמה?
            </h1>
            <p className="mt-2 text-sm leading-6 text-secondary">
              הזן את כתובת האימייל שלך ונשלח הוראות לאיפוס הסיסמה.
            </p>

            {success ? (
              <div
                role="alert"
                className="mt-6 rounded-2xl border border-default bg-white px-4 py-4 text-sm font-semibold leading-6 text-primary"
              >
                {success}
              </div>
            ) : (
              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="forgot-email"
                    className="block text-xs font-semibold uppercase tracking-wide text-secondary"
                  >
                    אימייל
                  </label>
                  <input
                    id="forgot-email"
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
                  disabled={submitting || !email}
                  className="mt-2 shadow-lg shadow-black/10"
                >
                  {submitting ? (
                    <AppLoader variant="button" label="שולח..." />
                  ) : (
                    "שלח הוראות איפוס"
                  )}
                </Button>
              </form>
            )}

            <p className="mt-5 text-center text-sm text-secondary">
              זכרת את הסיסמה?{" "}
              <Link
                to="/login"
                className="font-semibold text-[var(--accent-ink)] underline"
              >
                התחברות
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

export default ForgotPasswordPage;
