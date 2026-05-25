import { Mail } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import AppLoader from "../../components/loader";
import Button from "../../components/Button";
import { isAxiosError } from "../../lib/api";
import { notifyApiError } from "../../lib/toast";
import { forgotPassword } from "./api";
import AuthPageShell from "./components/AuthPageShell";
import AuthTextField from "./components/AuthTextField";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting || success) return;
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("יש להזין אימייל");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("אימייל לא תקין");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await forgotPassword(trimmedEmail);
      setSuccess(res.message);
      setEmail("");
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 422) {
        setError("אימייל לא תקין");
      } else {
        notifyApiError(err, "שגיאה בשרת, נסה שוב");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthPageShell
      eyebrow="איפוס סיסמה"
      title="שכחת סיסמה?"
      description="הזן את כתובת האימייל שלך ונשלח הוראות לאיפוס הסיסמה."
      footer={
        <footer className="mt-auto pb-6 pt-10 text-center">
          <p className="text-sm text-secondary">
            זכרת את הסיסמה?{" "}
            <Link
              to="/login"
              className="font-semibold text-[var(--accent-ink)] underline"
            >
              התחברות
            </Link>
          </p>
        </footer>
      }
    >
      {success ? (
        <div className="rounded-2xl border border-default bg-[var(--surface)] p-4 text-sm leading-6 text-secondary">
          אפשר לבדוק את תיבת האימייל ולהמשיך לפי ההוראות שנשלחו.
        </div>
      ) : (
        <form noValidate onSubmit={onSubmit} className="flex flex-grow flex-col gap-4">
          <AuthTextField
            id="forgot-email"
            label="אימייל"
            icon={<Mail className="h-5 w-5" aria-hidden="true" />}
            type="email"
            autoComplete="email"
            inputMode="email"
            dir="ltr"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            disabled={submitting}
            placeholder="name@example.com"
            error={error ?? undefined}
          />

          <div className="mt-6">
            <Button
              type="submit"
              fullWidth
              disabled={submitting}
              className="h-14 rounded-2xl bg-black text-base font-bold text-white shadow-sm active:scale-95"
            >
              {submitting ? (
                <AppLoader variant="button" label="שולח..." />
              ) : (
                "שלח הוראות איפוס"
              )}
            </Button>
          </div>
        </form>
      )}
    </AuthPageShell>
  );
};

export default ForgotPasswordPage;
