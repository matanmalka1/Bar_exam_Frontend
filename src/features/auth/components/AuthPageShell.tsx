import type { ReactNode } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme, type ThemePreference } from "../../../lib/useTheme";

type AuthPageShellProps = {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
};

const THEME_OPTIONS: { value: ThemePreference; icon: typeof Sun; label: string }[] = [
  { value: "light", icon: Sun, label: "בהיר" },
  { value: "dark", icon: Moon, label: "כהה" },
  { value: "system", icon: Monitor, label: "מערכת" },
];

const ThemeToggle = () => {
  const { preference, setTheme } = useTheme();
  return (
    <div className="flex items-center gap-1 rounded-xl border border-[var(--border-default)] bg-[var(--surface-muted)] p-1">
      {THEME_OPTIONS.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          type="button"
          aria-label={label}
          onClick={() => setTheme(value)}
          className={[
            "flex h-7 w-7 items-center justify-center rounded-lg transition",
            preference === value
              ? "bg-[var(--ink)] text-[var(--paper)]"
              : "text-secondary hover:text-primary",
          ].join(" ")}
        >
          <Icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
};

const AuthPageShell = ({
  eyebrow,
  title,
  description,
  children,
  footer,
}: AuthPageShellProps) => (
  <div
    dir="rtl"
    className="relative min-h-svh overflow-hidden bg-[var(--paper)] text-[var(--ink)]"
  >
    <div className="pointer-events-none fixed inset-0 opacity-[0.04] [background-image:radial-gradient(circle_at_1px_1px,#000_1px,transparent_0)] [background-size:18px_18px]" />
    <div className="pointer-events-none fixed bottom-[-5%] left-[-10%] z-0 h-[20%] w-[60%] rounded-full bg-white/30 blur-3xl" />

    <main className="relative z-10 mx-auto flex min-h-svh w-full max-w-[430px] flex-col px-5 py-6">
      <div className="flex justify-end mb-2">
        <ThemeToggle />
      </div>
      <header className="mb-10 flex flex-col items-center text-center">
        <span className="mb-2 text-[11px] font-semibold uppercase leading-none tracking-[0.2em] text-secondary">
          {eyebrow}
        </span>
        <h1 className="font-display text-3xl font-black leading-tight text-[var(--ink)]">
          {title}
        </h1>
        {description && (
          <p className="mt-4 max-w-[330px] text-sm leading-6 text-secondary">
            {description}
          </p>
        )}
      </header>

      {children}
      {footer}
    </main>
  </div>
);

export default AuthPageShell;
