import type { ButtonHTMLAttributes } from "react";
import { cn } from "../lib/cn";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

const Chip = ({ selected, className, type = "button", ...rest }: ChipProps) => (
  <button
    type={type}
    aria-pressed={selected}
    className={cn(
      "focus-ring rounded-full border px-4 py-2 text-sm font-medium transition disabled:opacity-45",
      selected
        ? "button-primary"
        : "badge-default hover:bg-[var(--surface-muted)]",
      className,
    )}
    {...rest}
  />
);

export default Chip;
