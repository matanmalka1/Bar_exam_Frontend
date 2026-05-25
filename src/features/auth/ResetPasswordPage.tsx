import { Lock } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Alert from "../../components/Alert";
import AppLoader from "../../components/loader";
import Button from "../../components/Button";
import ErrorState from "../../components/ErrorState";
import PasswordToggle from "../../components/PasswordToggle";
import { getApiErrorMessage, isAxiosError } from "../../lib/api";
import { notifySuccess } from "../../lib/toast";
import { resetPassword } from "./api";
import AuthPageShell from "./components/AuthPageShell";
import AuthTextField from "./components/AuthTextField";
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
      <AuthPageShell eyebrow="איפוס סיסמה" title="קישור לא תקין">
        <ErrorState
          title="קישור לא תקין"
          message="קישור איפוס הסיסמה חסר, פג תוקף או לא תקין."
          action={
            <Button
              type="button"
              fullWidth
              onClick={() => navigate("/forgot-password")}
            >
              בקש קישור חדש
            </Button>
          }
        />
      </AuthPageShell>
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
      const message = isAxiosError(err)
        ? (getApiErrorMessage(err) ?? "לא ניתן לאפס סיסמה. נסה לבקש קישור חדש")
        : "לא ניתן לאפס סיסמה. נסה לבקש קישור חדש";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthPageShell
      eyebrow="איפוס סיסמה"
      title="סיסמה חדשה"
      description="בחר סיסמה חזקה. אחרי האיפוס תוכל להתחבר מיד."
      footer={
        !success ? (
          <footer className="mt-auto pb-6 pt-10 text-center">
            <p className="text-sm text-secondary">
              הקישור לא עובד?{" "}
              <Link
                to="/forgot-password"
                className="font-semibold text-[var(--accent-ink)] underline"
              >
                בקש קישור חדש
              </Link>
            </p>
          </footer>
        ) : null
      }
    >
      {success ? (
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-default bg-[var(--surface)] p-4">
            <p className="text-base font-bold">הסיסמה אופסה בהצלחה</p>
            <p className="mt-1 text-sm leading-6 text-secondary">
              אפשר להתחבר עכשיו עם הסיסמה החדשה.
            </p>
          </div>
          <Button
            type="button"
            fullWidth
            className="h-14 rounded-2xl bg-black text-base font-bold text-white shadow-sm active:scale-95"
            onClick={() => navigate("/login", { replace: true })}
          >
            להתחברות
          </Button>
        </div>
      ) : (
        <form
          noValidate
          onSubmit={onSubmit}
          className="flex flex-grow flex-col gap-4"
        >
          <AuthTextField
            id="reset-new-password"
            label="סיסמה חדשה"
            icon={<Lock className="h-5 w-5" aria-hidden="true" />}
            type={showNewPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setError(null);
            }}
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

          <AuthTextField
            id="reset-confirm"
            label="אימות סיסמה"
            icon={<Lock className="h-5 w-5" aria-hidden="true" />}
            type={showConfirm ? "text" : "password"}
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => {
              setConfirm(e.target.value);
              setError(null);
            }}
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

          <div className="mt-6">
            <Button
              type="submit"
              fullWidth
              disabled={submitting || !newPassword || !confirm}
              className="h-14 rounded-2xl bg-black text-base font-bold text-white shadow-sm active:scale-95"
            >
              {submitting ? (
                <AppLoader variant="button" label="מאפס..." />
              ) : (
                "איפוס סיסמה"
              )}
            </Button>
          </div>
        </form>
      )}
    </AuthPageShell>
  );
};

export default ResetPasswordPage;
