import type { ButtonHTMLAttributes } from "react";
import { cn } from "../lib/cn";

interface ActionCardProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

const ActionCard = ({
  className,
  selected,
  type = "button",
  ...rest
}: ActionCardProps) => (
  <button
    type={type}
    className={cn(
      "w-full rounded-2xl border border-[#e6dcc9] bg-white/85 p-4 text-right shadow-[0_10px_30px_rgba(79,31,64,0.07)] transition hover:border-[var(--accent)] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--paper)] disabled:cursor-not-allowed disabled:opacity-70",
      selected &&
        "border-[var(--accent)] bg-[var(--accent-soft)] ring-1 ring-[var(--accent)]",
      className,
    )}
    {...rest}
  />
);

export default ActionCard;
