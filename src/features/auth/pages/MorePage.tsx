import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Mail, UserRound, Info, ChevronLeft, Trash2 } from "lucide-react";
import AppHeader from "../../../components/AppHeader";
import Card from "../../../components/Card";
import ConfirmSheet from "../../../components/ConfirmSheet";
import PageShell from "../../../components/PageShell";
import { notifyError } from "../../../lib/toast";
import { resetUserData } from "../api";
import { useAuth } from "../useAuth";

const SectionTitle = ({ children }: { children: ReactNode }) => (
  <h2 className="font-display text-sm font-bold text-[var(--accent-ink)]">
    {children}
  </h2>
);

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-center gap-3 rounded-2xl border border-default bg-[var(--surface-muted)] px-4 py-3">
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-[var(--accent-ink)]">
      {icon}
    </span>

    <div className="min-w-0">
      <p className="text-xs text-secondary">{label}</p>
      <p className="truncate text-sm font-medium text-primary">{value}</p>
    </div>
  </div>
);

const ActionRow = ({
  icon,
  title,
  description,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="flex w-full items-center justify-between gap-3 rounded-2xl border border-default bg-surface px-4 py-3 text-right transition hover:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ink)]/30"
  >
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[var(--accent-ink)]">
        {icon}
      </span>

      <span>
        <span className="block text-sm font-semibold text-primary">{title}</span>
        <span className="mt-0.5 block text-xs text-secondary">
          {description}
        </span>
      </span>
    </div>

    <ChevronLeft className="h-4 w-4 shrink-0 text-secondary" />
  </button>
);

const MorePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);

  const onResetData = async () => {
    setResetting(true);
    try {
      await resetUserData();
      navigate("/", { replace: true });
    } catch {
      notifyError("אירעה שגיאה. נסה שוב.");
    } finally {
      setResetting(false);
      setConfirmReset(false);
    }
  };

  const onLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <PageShell className="pb-8">
      <div className="space-y-5">
        <AppHeader title="פרופיל" />

        <section className="space-y-3">
          <SectionTitle>חשבון</SectionTitle>

          <Card className="space-y-3">
            {user ? (
              <>
                <InfoRow
                  icon={<UserRound className="h-5 w-5" />}
                  label="שם מלא"
                  value={user.full_name}
                />

                <InfoRow
                  icon={<Mail className="h-5 w-5" />}
                  label="אימייל"
                  value={user.email}
                />
              </>
            ) : (
              <p className="text-sm text-secondary">לא נמצאו פרטי משתמש.</p>
            )}
          </Card>
        </section>

        <section className="space-y-3">
          <SectionTitle>אפליקציה</SectionTitle>

          <Card className="space-y-3">
            <InfoRow
              icon={<Info className="h-5 w-5" />}
              label="אודות"
              value="תרגול בחינות לשכה · גרסת MVP"
            />
          </Card>
        </section>

        <section className="space-y-3">
          <SectionTitle>פעולות</SectionTitle>

          <ActionRow
            icon={<Trash2 className="h-5 w-5" />}
            title="אפס נתוני משתמש"
            description="מחיקת כל התשובות, המפגשים, הטעויות והסימניות"
            onClick={() => setConfirmReset(true)}
          />

          <ActionRow
            icon={<LogOut className="h-5 w-5" />}
            title="התנתקות"
            description="יציאה מהחשבון וחזרה למסך ההתחברות"
            onClick={() => setConfirmLogout(true)}
          />
        </section>
      </div>

      <ConfirmSheet
        open={confirmReset}
        title="למחוק את כל הנתונים?"
        description="פעולה זו תמחק לצמיתות את כל התשובות, המפגשים, הטעויות והסימניות. לא ניתן לשחזר."
        confirmLabel={resetting ? "מוחק..." : "מחק הכל"}
        cancelLabel="ביטול"
        onConfirm={() => void onResetData()}
        onCancel={() => setConfirmReset(false)}
      />

      <ConfirmSheet
        open={confirmLogout}
        title="להתנתק מהחשבון?"
        description="תועבר למסך ההתחברות."
        confirmLabel="התנתק"
        cancelLabel="ביטול"
        onConfirm={() => {
          setConfirmLogout(false);
          void onLogout();
        }}
        onCancel={() => setConfirmLogout(false)}
      />
    </PageShell>
  );
};

export default MorePage;
