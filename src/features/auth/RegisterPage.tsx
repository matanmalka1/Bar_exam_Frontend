import { useState, type FormEvent } from "react";
import { ArrowLeft, Lock, Mail, ShieldCheck, User } from "lucide-react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import Alert from "../../components/Alert";
import AppLoader from "../../components/loader";
import Button from "../../components/Button";
import PasswordToggle from "../../components/PasswordToggle";
import { isApiStatusError } from "../../lib/api";
import { notifyApiError } from "../../lib/toast";
import AuthPageShell from "./components/AuthPageShell";
import AuthTextField from "./components/AuthTextField";
import { RegisterFormSchema } from "./schemas";
import type { RegisterRequest } from "./types";
import { useAuth } from "./useAuth";

type RegisterDraft = {
  fullName: string;
  email: string;
  password: string;
  confirm: string;
  acceptedTerms: boolean;
};

type RegisterFieldErrors = {
  fullName?: string;
  email?: string;
  password?: string;
  confirm?: string;
  terms?: string;
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
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const registerDraft: RegisterDraft = {
    fullName,
    email,
    password,
    confirm,
    acceptedTerms,
  };

  if (status === "authenticated") return <Navigate to="/" replace />;

  const validate = (): { ok: true; data: RegisterRequest } | { ok: false } => {
    const requiredErrors: RegisterFieldErrors = {};

    if (!fullName.trim()) requiredErrors.fullName = "שם מלא הוא שדה חובה";
    if (!email.trim()) requiredErrors.email = "יש להזין אימייל";
    if (!password) requiredErrors.password = "יש להזין סיסמה";
    if (!confirm) requiredErrors.confirm = "יש לאמת את הסיסמה";
    if (!acceptedTerms) {
      requiredErrors.terms = "יש לאשר את תנאי השימוש ומדיניות הפרטיות";
    }

    if (Object.values(requiredErrors).some(Boolean)) {
      setFieldErrors(requiredErrors);
      setFormError(null);
      return { ok: false };
    }

    const result = RegisterFormSchema.safeParse({
      full_name: fullName,
      email,
      password,
      confirm,
    });
    if (!result.success) {
      const nextFieldErrors: RegisterFieldErrors = {};

      result.error.issues.forEach((issue) => {
        const field = issue.path[0];

        if (field === "full_name" && !nextFieldErrors.fullName) {
          nextFieldErrors.fullName = fullName.trim()
            ? issue.message
            : "שם מלא הוא שדה חובה";
        }
        if (field === "email" && !nextFieldErrors.email) {
          nextFieldErrors.email = email.trim()
            ? issue.message
            : "יש להזין אימייל";
        }
        if (field === "password" && !nextFieldErrors.password) {
          nextFieldErrors.password = password
            ? issue.message
            : "יש להזין סיסמה";
        }
        if (field === "confirm" && !nextFieldErrors.confirm) {
          nextFieldErrors.confirm = confirm
            ? issue.message
            : "יש לאמת את הסיסמה";
        }
      });

      setFieldErrors(nextFieldErrors);
      setFormError(null);
      return {
        ok: false,
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
    const validation = validate();
    if (!validation.ok) {
      return;
    }
    setFieldErrors({});
    setFormError(null);
    setSubmitting(true);
    try {
      await register(validation.data);
      navigate("/", { replace: true });
    } catch (err) {
      if (isApiStatusError(err, 409)) {
        setFormError("כבר קיים משתמש עם האימייל הזה");
      } else if (isApiStatusError(err, 422)) {
        setFormError("לא ניתן ליצור חשבון עם הפרטים שהוזנו");
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
        <form
          noValidate
          onSubmit={onSubmit}
          className="flex flex-1 flex-col gap-4"
        >
          <AuthTextField
            id="reg-name"
            label="שם מלא"
            icon={<User className="h-5 w-5" aria-hidden="true" />}
            type="text"
            autoComplete="name"
            required
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              setFormError(null);
              setFieldErrors((current) => ({
                ...current,
                fullName: undefined,
              }));
            }}
            disabled={submitting}
            placeholder="ישראל ישראלי"
            error={fieldErrors.fullName}
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
            onChange={(e) => {
              setEmail(e.target.value);
              setFormError(null);
              setFieldErrors((current) => ({
                ...current,
                email: undefined,
              }));
            }}
            disabled={submitting}
            placeholder="name@example.com"
            className="text-right placeholder:text-right"
            error={fieldErrors.email}
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
            onChange={(e) => {
              setPassword(e.target.value);
              setFormError(null);
              setFieldErrors((current) => ({
                ...current,
                password: undefined,
              }));
            }}
            disabled={submitting}
            placeholder="••••••••"
            error={fieldErrors.password}
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
            onChange={(e) => {
              setConfirm(e.target.value);
              setFormError(null);
              setFieldErrors((current) => ({
                ...current,
                confirm: undefined,
              }));
            }}
            disabled={submitting}
            placeholder="••••••••"
            error={fieldErrors.confirm}
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
              onChange={(e) => {
                setAcceptedTerms(e.target.checked);
                setFormError(null);
                setFieldErrors((current) => ({
                  ...current,
                  terms: undefined,
                }));
              }}
              disabled={submitting}
              className="mt-1 h-4 w-4 rounded border-[var(--border-default)] text-[var(--ink)] focus:ring-[var(--ink)] disabled:opacity-45"
              aria-invalid={!!fieldErrors.terms || undefined}
              aria-describedby={fieldErrors.terms ? "reg-terms-error" : undefined}
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

          {fieldErrors.terms && (
            <p
              id="reg-terms-error"
              className="-mt-2 pe-1 text-xs font-semibold text-primary"
            >
              {fieldErrors.terms}
            </p>
          )}

          {formError && (
            <Alert variant="error" className="bg-white/80">
              {formError}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            disabled={submitting}
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
