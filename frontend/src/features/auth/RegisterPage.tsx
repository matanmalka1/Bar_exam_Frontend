import {
  useState,
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { ArrowLeft, Lock, Mail, ShieldCheck, User } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Alert from "../../components/Alert";
import AppLoader from "../../components/loader";
import Button from "../../components/Button";
import PasswordToggle from "../../components/PasswordToggle";
import { isApiStatusError } from "../../lib/api";
import { notifyApiError, notifyError } from "../../lib/toast";
import { RegisterFormSchema } from "./schemas";
import type { RegisterRequest } from "./types";
import { useAuth } from "./useAuth";

type RegisterFieldProps = {
  id: string;
  label: string;
  icon: ReactNode;
  endSlot?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>;

const RegisterField = ({
  id,
  label,
  icon,
  endSlot,
  className = "",
  ...inputProps
}: RegisterFieldProps) => (
  <div className="flex flex-col gap-1">
    <label
      htmlFor={id}
      className="pe-2 text-sm font-semibold leading-none text-secondary"
    >
      {label}
    </label>
    <div className="group relative">
      <input
        id={id}
        className={`h-12 w-full rounded-2xl border border-[var(--border-default)] bg-white px-12 py-3 text-base text-[var(--ink)] outline-none transition duration-200 placeholder:text-black/35 focus:border-[var(--ink)] focus:ring-0 disabled:opacity-45 ${className}`}
        {...inputProps}
      />
      <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-black/35 transition-colors group-focus-within:text-[var(--ink)]">
        {icon}
      </span>
      {endSlot && (
        <span className="absolute inset-y-0 left-3 flex items-center">
          {endSlot}
        </span>
      )}
    </div>
  </div>
);

const RegisterPage = () => {
  const { status, register } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (status === "authenticated") return <Navigate to="/" replace />;

  const validate = ():
    | { ok: true; data: RegisterRequest }
    | { ok: false; error: string } => {
    const result = RegisterFormSchema.safeParse({
      full_name: fullName,
      email,
      password,
      confirm,
    });
    if (!result.success) {
      return {
        ok: false,
        error: result.error.issues[0]?.message ?? "נתונים לא תקינים",
      };
    }
    return {
      ok: true,
      data: {
        full_name: result.data.full_name,
        email: result.data.email,
        password: result.data.password,
      },
    };
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!acceptedTerms) {
      setError("יש לאשר את תנאי השימוש ומדיניות הפרטיות");
      return;
    }
    const validation = validate();
    if (!validation.ok) {
      setError(validation.error);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await register(validation.data);
      navigate("/", { replace: true });
    } catch (err) {
      if (isApiStatusError(err, 409)) {
        notifyError("כבר קיים משתמש עם האימייל הזה");
      } else if (isApiStatusError(err, 422)) {
        notifyError("נתונים לא תקינים. בדוק שוב את הפרטים");
      } else {
        notifyApiError(err, "ההרשמה נכשלה. נסה שוב");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      dir="rtl"
      className="relative min-h-svh overflow-hidden bg-[var(--paper)] text-[var(--ink)]"
    >
      <div className="pointer-events-none fixed inset-0 opacity-[0.04] [background-image:radial-gradient(circle_at_1px_1px,#000_1px,transparent_0)] [background-size:18px_18px]" />
      <div className="pointer-events-none fixed bottom-[-5%] left-[-10%] z-0 h-[20%] w-[60%] rounded-full bg-white/30 blur-3xl" />

      <main className="relative z-10 mx-auto flex min-h-svh w-full max-w-[430px] flex-col px-5 py-6">
        <header className="mb-10 flex flex-col text-right">
          <span className="mb-1 text-[11px] font-medium uppercase leading-none tracking-[0.18em] text-secondary">
            הרשמה
          </span>
          <h1 className="font-display text-xl font-black leading-[1.3] text-[var(--ink)]">
            צור חשבון
          </h1>
        </header>

        <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-4">
          <RegisterField
            id="reg-name"
            label="שם מלא"
            icon={<User className="h-5 w-5" aria-hidden="true" />}
            type="text"
            autoComplete="name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={submitting}
            placeholder="ישראל ישראלי"
          />

          <RegisterField
            id="reg-email"
            label="אימייל"
            icon={<Mail className="h-5 w-5" aria-hidden="true" />}
            type="email"
            autoComplete="email"
            inputMode="email"
            dir="ltr"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitting}
            placeholder="name@example.com"
            className="text-right placeholder:text-right"
          />

          <RegisterField
            id="reg-password"
            label="סיסמה"
            icon={<Lock className="h-5 w-5" aria-hidden="true" />}
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={8}
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

          <RegisterField
            id="reg-confirm"
            label="אימות סיסמה"
            icon={<ShieldCheck className="h-5 w-5" aria-hidden="true" />}
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            disabled={submitting}
            placeholder="••••••••"
            endSlot={
              <PasswordToggle
                visible={showConfirmPassword}
                onToggle={() => setShowConfirmPassword((v) => !v)}
                disabled={submitting}
              />
            }
          />

          <div className="mt-2 flex items-start gap-2 pe-1">
            <input
              id="reg-terms"
              type="checkbox"
              required
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              disabled={submitting}
              className="mt-1 h-4 w-4 rounded border-[var(--border-default)] text-[var(--ink)] focus:ring-[var(--ink)] disabled:opacity-45"
            />
            <label htmlFor="reg-terms" className="text-sm text-secondary">
              אני מסכים{" "}
              <Link
                to="/terms"
                className="font-bold text-[var(--ink)] underline underline-offset-4"
              >
                לתנאי השימוש
              </Link>{" "}
              ולמדיניות הפרטיות של המערכת.
            </label>
          </div>

          {error && (
            <Alert variant="error" className="bg-white/80">
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            disabled={
              submitting ||
              !fullName ||
              !email ||
              !password ||
              !confirm ||
              !acceptedTerms
            }
            className="mt-6 h-14 rounded-2xl bg-black text-lg font-bold text-white shadow-sm active:scale-95"
          >
            {submitting ? (
              <AppLoader variant="button" label="נרשם..." />
            ) : (
              <>
                הרשמה
                <ArrowLeft className="h-5 w-5" aria-hidden="true" />
              </>
            )}
          </Button>
        </form>

        <p className="mt-auto pt-10 pb-6 text-center text-sm text-secondary">
          כבר יש לך חשבון?{" "}
          <Link
            to="/login"
            className="me-1 font-bold text-[var(--accent-ink)] underline-offset-4 transition hover:underline"
          >
            התחברות
          </Link>
        </p>
      </main>
    </div>
  );
};

export default RegisterPage;
