import { Toaster } from "sonner";
import type { ToastClassnames } from "sonner";

const toastClassNames = {
  toast:
    "!w-[calc(100vw-1.5rem)] sm:!w-[360px] !rounded-2xl !border !border-[var(--border-default)] !bg-[var(--surface-muted)] !px-4 !py-3.5 !shadow-[0_12px_32px_rgba(0,0,0,0.18)] !gap-3 !text-[var(--ink)]",
  title: "!text-sm !font-bold !leading-snug !text-[var(--text-primary)]",
  description: "!text-xs !leading-snug !text-[var(--text-secondary)]",
  icon: "!mt-0 !shrink-0 !text-[var(--text-secondary)]",
} satisfies ToastClassnames;

const AppToaster = () => (
  <Toaster
    dir="rtl"
    position="top-center"
    duration={4200}
    gap={8}
    mobileOffset={14}
    offset={16}
    visibleToasts={3}
    toastOptions={{
      classNames: toastClassNames,
    }}
  />
);

export default AppToaster;
