import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "../../../lib/cn";

type AuthTextFieldProps = {
  id: string;
  label: string;
  icon: ReactNode;
  error?: string;
  endSlot?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>;

const AuthTextField = ({
  id,
  label,
  icon,
  error,
  endSlot,
  className,
  ...inputProps
}: AuthTextFieldProps) => {
  const isLtr = inputProps.dir === "ltr";

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="pe-2 text-sm font-bold leading-none text-[var(--ink)]"
      >
        {label}
      </label>
      <div className="group relative">
        <input
          id={id}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            "h-14 w-full rounded-[1.75rem] border bg-white py-3 text-base text-[var(--ink)] shadow-sm outline-none transition duration-200 placeholder:text-black/40 focus:border-[var(--ink)] focus:ring-0 disabled:opacity-45",
            isLtr ? "pr-5 pl-12 text-left placeholder:text-right" : "pr-12 pl-12 text-right",
            error ? "border-[var(--border-strong)]" : "border-[var(--border-default)]",
            className,
          )}
          {...inputProps}
        />
        <span
          className={cn(
            "pointer-events-none absolute inset-y-0 flex items-center text-black/35 transition-colors group-focus-within:text-[var(--ink)]",
            isLtr ? "left-4" : "right-4",
          )}
        >
          {icon}
        </span>
        {endSlot && (
          <span className="absolute inset-y-0 left-3 flex items-center">
            {endSlot}
          </span>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className="text-xs font-semibold text-primary">
          {error}
        </p>
      )}
    </div>
  );
};

export default AuthTextField;
