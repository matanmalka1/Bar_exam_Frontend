import axios from "axios";
import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Alert from "../../components/Alert";
import Button from "../../components/Button";
import AppLoader from "../../components/loader";
import { getApiErrorDetail } from "../../lib/api";
import { resetPassword } from "./api";
import { ResetPasswordFormSchema } from "./schemas";

const inputClass =
  "focus-ring w-full rounded-2xl border border-default bg-white/90 px-4 py-3 text-base text-primary shadow-inner placeholder:text-black/45 outline-none transition focus:bg-white disabled:opacity-45";

const ResetPasswordPage = () => {
  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!token) {
    return (
      <div
        dir="rtl"
        className="relative min-h-screen overflow-hidden bg-[var(--paper)] text-[var(--ink)]"
      >
        <div className="relative mx-auto flex min-h-screen w-full max-w-[460px] flex-col justify-center p-5">
          <div className="surface-muted relative overflow-hidden rounded-[2rem] border border-default p-7 shadow-[var(--shadow-elevated)]">
            <div className="relative">
              <h1 className="font-display text-[2rem] font-black text-[var(--accent-ink)]">
                קישור לא תקין
              </h1>
              <p className="mt-3 text-sm leading-6 text-secondary">
                קישור איפוס הסיסמה חסר או לא תקין.
              </p>
              <div className="mt-6">
                <Link
                  to="/forgot-password"
                  className="font-semibold text-[var(--accent-ink)] underline"
                >
                  בקש קישור חדש
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const validate = (): string | null => {
    const result = ResetPasswordFormSchema.safeParse({ new_password: newPassword, confirm });
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
      await resetPassword(token, newPassword);
      setSuccess(true);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const detail = getApiErrorDetail(err);
        setError(
          typeof detail === "string" ? detail : "לא ניתן לאפס סיסמה. נסה לבקש קישור חדש",
        );
      } else {
        setError("לא ניתן לאפס סיסמה. נסה לבקש קישור חדש");
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
              סיסמה חדשה
            </h1>
            <p className="mt-2 text-sm leading-6 text-secondary">
              הגדר סיסמה חדשה לחשבונך.
            </p>

            {success ? (
              <div className="mt-6 space-y-4">
                <Alert variant="success">הסיסמה אופסה בהצלחה</Alert>
                <Button
                  type="button"
                  fullWidth
                  onClick={() => navigate("/login", { replace: true })}
                  className="shadow-lg shadow-black/10"
                >
                  להתחברות
                </Button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="reset-new-password"
                    className="block text-xs font-semibold uppercase tracking-wide text-secondary"
                  >
                    סיסמה חדשה
                  </label>
                  <div className="relative">
                    <input
                      id="reset-new-password"
                      type={showNewPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`${inputClass} pl-14`}
                      disabled={submitting}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((v) => !v)}
                      aria-label={showNewPassword ? "הסתר סיסמה" : "הצג סיסמה"}
                      aria-pressed={showNewPassword}
                      className="absolute inset-y-0 left-2 my-auto h-8 rounded-xl px-2 text-xs font-semibold text-secondary hover:text-primary disabled:opacity-45"
                      disabled={submitting}
                    >
                      {showNewPassword ? "הסתר" : "הצג"}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="reset-confirm"
                    className="block text-xs font-semibold uppercase tracking-wide text-secondary"
                  >
                    אימות סיסמה
                  </label>
                  <div className="relative">
                    <input
                      id="reset-confirm"
                      type={showConfirm ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className={`${inputClass} pl-14`}
                      disabled={submitting}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      aria-label={showConfirm ? "הסתר סיסמה" : "הצג סיסמה"}
                      aria-pressed={showConfirm}
                      className="absolute inset-y-0 left-2 my-auto h-8 rounded-xl px-2 text-xs font-semibold text-secondary hover:text-primary disabled:opacity-45"
                      disabled={submitting}
                    >
                      {showConfirm ? "הסתר" : "הצג"}
                    </button>
                  </div>
                </div>

                {error && <Alert variant="error">{error}</Alert>}

                <Button
                  type="submit"
                  fullWidth
                  disabled={submitting || !newPassword || !confirm}
                  className="mt-2 shadow-lg shadow-black/10"
                >
                  {submitting ? (
                    <AppLoader variant="button" label="מאפס..." />
                  ) : (
                    "איפוס סיסמה"
                  )}
                </Button>
              </form>
            )}

            {!success && (
              <p className="mt-5 text-center text-sm text-secondary">
                <Link
                  to="/forgot-password"
                  className="font-semibold text-[var(--accent-ink)] underline"
                >
                  בקש קישור חדש
                </Link>
              </p>
            )}
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-secondary">
          תרגול בחינות לשכת עורכי הדין
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
