import axios from "axios";
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import AppHeader from "../../components/AppHeader";
import AppLoader from "../../components/loader";
import Button from "../../components/Button";
import TextField from "../../components/TextField";
import { notifyApiError } from "../../lib/toast";
import { forgotPassword } from "./api";

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
      if (axios.isAxiosError(err) && err.response?.status === 422) {
        setError("אימייל לא תקין");
      } else {
        notifyApiError(err, "שגיאה בשרת, נסה שוב");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-svh bg-[var(--paper)] text-[var(--ink)]">
      <div className="mx-auto flex min-h-svh w-full max-w-[480px] flex-col px-5 pb-8 pt-6">
        <AppHeader
          back={{ to: "/login" }}
          eyebrow="איפוס סיסמה"
          eyebrowClassName="text-lg font-bold tracking-normal text-primary"
          title="שכחת סיסמה?"
          titleLayout="stacked"
          variant="inline"
        />

        <p className="mb-4 text-sm leading-6 text-secondary">
          הזן את כתובת האימייל שלך ונשלח הוראות לאיפוס הסיסמה.
        </p>

        {success ? (
          <div className="rounded-2xl border border-default bg-[var(--surface)] p-4 text-sm leading-6 text-secondary">
            אפשר לבדוק את תיבת האימייל ולהמשיך לפי ההוראות שנשלחו.
          </div>
        ) : (
          <form
            noValidate
            onSubmit={onSubmit}
            className="flex flex-1 flex-col gap-4"
          >
            <TextField
              id="forgot-email"
              label="אימייל"
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
              className="text-right"
              error={error ?? undefined}
            />

            <Button
              type="submit"
              fullWidth
              disabled={submitting}
              className="mt-2"
            >
              {submitting ? (
                <AppLoader variant="button" label="שולח..." />
              ) : (
                "שלח הוראות איפוס"
              )}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-secondary">
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
  );
};

export default ForgotPasswordPage;
