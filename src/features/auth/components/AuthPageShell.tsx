import type { ReactNode } from "react";

type AuthPageShellProps = {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
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
