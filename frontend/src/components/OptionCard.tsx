import type { ButtonHTMLAttributes } from "react";
import { cn } from "../lib/cn";

export type OptionMode = "practice" | "exam" | "review";

interface OptionCardProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  mode: OptionMode;
  label: string;
  text: string;
  selected?: boolean;
  isCorrect?: boolean;
  isWrong?: boolean;
}

const OptionCard = ({
  mode,
  label,
  text,
  selected,
  isCorrect,
  isWrong,
  className,
  type = "button",
  ...rest
}: OptionCardProps) => {
  // Exam mode MUST ignore correctness props.
  const showCorrectness = mode !== "exam";
  const correct = showCorrectness && isCorrect;
  const wrong = showCorrectness && isWrong;

  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cn(
        "focus-ring flex w-full items-start gap-3 rounded-2xl border p-4 text-right transition disabled:opacity-80",
        !correct && !wrong && selected && "surface-muted border-strong",
        !correct &&
          !wrong &&
          !selected &&
          "surface border-default hover:bg-[var(--surface-muted)]",
        correct && "surface-muted border-strong",
        wrong && "surface border-2 border-strong font-semibold",
        className,
      )}
      {...rest}
    >
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold",
          selected
            ? "border-strong text-primary"
            : "border-default text-secondary",
          correct && "surface border-strong text-primary",
          wrong && "border-strong text-primary",
        )}
      >
        {label}
      </span>
      <span className="flex-1 text-base leading-relaxed text-primary">
        {text}
      </span>
    </button>
  );
};

export default OptionCard;
