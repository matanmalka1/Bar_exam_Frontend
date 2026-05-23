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
}: AuthTextFieldProps) => (
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
        aria-invalid={!!error || undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          "h-12 w-full rounded-2xl border bg-white px-12 py-3 text-base text-[var(--ink)] outline-none transition duration-200 placeholder:text-black/35 focus:border-[var(--ink)] focus:ring-0 disabled:opacity-45",
          error ? "border-[var(--border-strong)]" : "border-[var(--border-default)]",
          className,
        )}
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
    {error && (
      <p id={`${id}-error`} className="text-xs font-semibold text-primary">
        {error}
      </p>
    )}
  </div>
);

export default AuthTextField;
