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
      "rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--paper)]",
      selected
        ? "border-[var(--accent)] bg-[var(--accent)] text-white"
        : "border-[#dccfbb] bg-white/75 text-stone-700 hover:bg-[var(--accent-soft)] hover:text-[var(--accent-ink)]",
      className,
    )}
    {...rest}
  />
);

export default Chip;
