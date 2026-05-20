import type { ButtonHTMLAttributes } from "react";
import { cn } from "../lib/cn";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

const VARIANT: Record<Variant, string> = {
  primary:
    "bg-[var(--accent)] text-white shadow-sm hover:bg-[var(--accent-ink)] disabled:bg-[#c9a4bd]",
  secondary:
    "border border-[var(--accent-soft)] bg-white/80 text-[var(--accent-ink)] hover:bg-[var(--accent-soft)] disabled:bg-white/50 disabled:text-stone-400",
  ghost:
    "bg-transparent text-[var(--accent-ink)] hover:bg-[var(--accent-soft)] disabled:text-stone-400",
};

const Button = ({
  variant = "primary",
  fullWidth,
  className,
  type = "button",
  ...rest
}: ButtonProps) => (
  <button
    type={type}
    className={cn(
      "inline-flex min-h-12 items-center justify-center rounded-2xl px-4 py-3 text-base font-semibold transition-colors disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--paper)]",
      VARIANT[variant],
      fullWidth && "w-full",
      className,
    )}
    {...rest}
  />
);

export default Button;
