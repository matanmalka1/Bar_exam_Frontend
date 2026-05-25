import type { ButtonHTMLAttributes } from "react";
import { cn } from "../lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

const VARIANT: Record<Variant, string> = {
  primary: "button-primary shadow-sm",
  secondary: "button-secondary border",
  ghost: "button-ghost border border-transparent",
  danger:
    "border border-[var(--color-fail)] bg-[var(--color-fail)] text-[var(--on-accent)] shadow-sm hover:brightness-95",
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
      "focus-ring inline-flex min-h-12 items-center justify-center rounded-2xl px-4 py-3 text-base font-semibold transition disabled:cursor-not-allowed disabled:opacity-45",
      VARIANT[variant],
      fullWidth && "w-full",
      className,
    )}
    {...rest}
  />
);

export default Button;
