import type { ReactNode } from "react";
import { cn } from "../lib/cn";

type AlertVariant = "error" | "info" | "success";

type AlertProps = {
  variant?: AlertVariant;
  title?: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
};

const Alert = ({
  variant = "info",
  title,
  children,
  action,
  className,
}: AlertProps) => {
  const base = "rounded-2xl px-4 py-3 text-sm font-semibold";

  const variantClass = {
    error: "border-2 border-strong bg-white text-primary",
    info: "border border-default bg-[var(--surface-muted)] text-primary",
    success: "bg-[var(--accent-ink)] text-white",
  }[variant];

  return (
    <div
      role={variant === "error" ? "alert" : undefined}
      className={cn(base, variantClass, className)}
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-0.5">
          {title && <p className="font-bold">{title}</p>}
          {children && <div>{children}</div>}
        </div>
        {action && <div className="mt-2 shrink-0 sm:mt-0 sm:ms-4">{action}</div>}
      </div>
    </div>
  );
};

export default Alert;
