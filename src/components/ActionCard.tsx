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
      "focus-ring surface w-full rounded-2xl border border-default p-4 text-right shadow-[var(--shadow-default)] transition hover:border-strong disabled:cursor-not-allowed disabled:opacity-45",
      selected && "surface-muted border-strong ring-1 ring-black/70",
      className,
    )}
    {...rest}
  />
);

export default ActionCard;
