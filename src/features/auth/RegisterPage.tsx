import { useState, type FormEvent } from "react";
import { ArrowLeft, Lock, Mail, ShieldCheck, User } from "lucide-react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import Alert from "../../components/Alert";
import AppLoader from "../../components/loader";
import Button from "../../components/Button";
import PasswordToggle from "../../components/PasswordToggle";
import { isApiStatusError } from "../../lib/api";
import { notifyApiError, notifyError } from "../../lib/toast";
import AuthPageShell from "./components/AuthPageShell";
import AuthTextField from "./components/AuthTextField";
import { RegisterFormSchema } from "./schemas";
import type { RegisterRequest } from "./types";
import { useAuth } from "./useAuth";

export type RegisterDraft = {
  fullName: string;
  email: string;
  password: string;
  confirm: string;
  acceptedTerms: boolean;
};

export type RegisterRouteState = {
  registerDraft?: RegisterDraft;
};

const getRegisterDraft = (state: unknown): RegisterDraft | null => {
  const draft = (state as RegisterRouteState | null)?.registerDraft;
  if (!draft) return null;
  return draft;
};

const RegisterPage = () => {
  const { status, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const initialDraft = getRegisterDraft(location.state);
  const [fullName, setFullName] = useState(initialDraft?.fullName ?? "");
  const [email, setEmail] = useState(initialDraft?.email ?? "");
  const [password, setPassword] = useState(initialDraft?.password ?? "");
  const [confirm, setConfirm] = useState(initialDraft?.confirm ?? "");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(
    initialDraft?.acceptedTerms ?? false,
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const registerDraft: RegisterDraft = {
    fullName,
    email,
    password,
    confirm,
    acceptedTerms,
  };

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
    <AuthPageShell
      eyebrow="הרשמה"
      title="צור חשבון"
      footer={
        <p className="mt-auto pt-10 pb-6 text-center text-sm text-secondary">
          כבר יש לך חשבון?{" "}
          <Link
            to="/login"
            className="me-1 font-bold text-[var(--accent-ink)] underline-offset-4 transition hover:underline"
          >
            התחברות
          </Link>
        </p>
      }
    >
        <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-4">
          <AuthTextField
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

          <AuthTextField
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

          <AuthTextField
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

          <AuthTextField
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
                state={{ registerDraft }}
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
    </AuthPageShell>
  );
};

export default RegisterPage;
