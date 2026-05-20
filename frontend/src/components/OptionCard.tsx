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
        "flex w-full items-start gap-3 rounded-2xl border p-4 text-right transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--paper)]",
        !correct &&
          !wrong &&
          selected &&
          "border-[var(--accent)] bg-[var(--accent-soft)]",
        !correct &&
          !wrong &&
          !selected &&
          "border-[#dccfbb] bg-white/85 hover:bg-white",
        correct && "border-green-600 bg-green-50",
        wrong && "border-red-600 bg-red-50",
        className,
      )}
      {...rest}
    >
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold",
          selected
            ? "border-[var(--accent)] text-[var(--accent)]"
            : "border-[#d6c8b4] text-stone-600",
          correct && "border-green-600 text-green-700",
          wrong && "border-red-600 text-red-700",
        )}
      >
        {label}
      </span>
      <span className="flex-1 text-base leading-relaxed text-gray-900">
        {text}
      </span>
    </button>
  );
};

export default OptionCard;
