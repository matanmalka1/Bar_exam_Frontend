import axios from "axios";
import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Alert from "../../components/Alert";
import AppHeader from "../../components/AppHeader";
import AppLoader from "../../components/loader";
import Button from "../../components/Button";
import ErrorState from "../../components/ErrorState";
import PasswordToggle from "../../components/PasswordToggle";
import TextField from "../../components/TextField";
import { getApiErrorMessage } from "../../lib/api";
import { notifyError, notifySuccess } from "../../lib/toast";
import { resetPassword } from "./api";
import { ResetPasswordFormSchema } from "./schemas";

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
      <div dir="rtl" className="min-h-svh bg-[var(--paper)] text-[var(--ink)]">
        <div className="mx-auto flex min-h-svh w-full max-w-[480px] flex-col px-5 pb-8 pt-6">
          <ErrorState
            title="קישור לא תקין"
            message="קישור איפוס הסיסמה חסר או לא תקין."
            action={
              <Button type="button" onClick={() => navigate("/forgot-password")}>
                בקש קישור חדש
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  const validate = (): string | null => {
    const result = ResetPasswordFormSchema.safeParse({
      new_password: newPassword,
      confirm,
    });
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
      notifySuccess("הסיסמה אופסה בהצלחה");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        notifyError(
          getApiErrorMessage(err) ?? "לא ניתן לאפס סיסמה. נסה לבקש קישור חדש",
        );
      } else {
        notifyError("לא ניתן לאפס סיסמה. נסה לבקש קישור חדש");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-svh bg-[var(--paper)] text-[var(--ink)]">
      <div className="mx-auto flex min-h-svh w-full max-w-[480px] flex-col px-5 pb-8 pt-6">
        <AppHeader
          back={{ to: "/forgot-password" }}
          eyebrow="איפוס סיסמה"
          title="סיסמה חדשה"
          variant="inline"
        />

        {success ? (
          <div className="flex flex-col gap-4">
            <p className="rounded-2xl border border-default bg-[var(--surface)] p-4 text-sm leading-6 text-secondary">
              אפשר להתחבר עכשיו עם הסיסמה החדשה.
            </p>
            <Button
              type="button"
              fullWidth
              onClick={() => navigate("/login", { replace: true })}
            >
              להתחברות
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-4">
            <TextField
              id="reset-new-password"
              label="סיסמה חדשה"
              type={showNewPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={submitting}
              placeholder="••••••••"
              endSlot={
                <PasswordToggle
                  visible={showNewPassword}
                  onToggle={() => setShowNewPassword((v) => !v)}
                  disabled={submitting}
                />
              }
            />

            <TextField
              id="reset-confirm"
              label="אימות סיסמה"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={submitting}
              placeholder="••••••••"
              endSlot={
                <PasswordToggle
                  visible={showConfirm}
                  onToggle={() => setShowConfirm((v) => !v)}
                  disabled={submitting}
                />
              }
            />

            {error && <Alert variant="error">{error}</Alert>}

            <Button
              type="submit"
              fullWidth
              disabled={submitting || !newPassword || !confirm}
              className="mt-2"
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
          <p className="mt-6 text-center text-sm text-secondary">
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
  );
};

export default ResetPasswordPage;
