import type { ButtonHTMLAttributes } from "react";
import { Check, X } from "lucide-react";
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
  disabled,
  className,
  type = "button",
  ...rest
}: OptionCardProps) => {
  // Exam mode MUST ignore correctness props.
  const showCorrectness = mode !== "exam";
  const correct = !!(showCorrectness && isCorrect);
  const wrong = !!(showCorrectness && isWrong);
  const neutralSelected = !!selected && !correct && !wrong;
  const faded = !!disabled && !selected && !correct && !wrong;

  return (
    <button
      type={type}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        "focus-ring group flex w-full items-start gap-3 rounded-2xl border p-4 text-right transition disabled:cursor-default",
        // unselected, no result
        !correct &&
          !wrong &&
          !neutralSelected &&
          "surface border-default hover:border-strong hover:bg-[var(--surface-muted)] active:scale-[0.99]",
        // selected, no result yet
        neutralSelected &&
          "surface-muted border-strong shadow-[var(--shadow-default)]",
        // correct revealed (practice/review)
        correct &&
          "border-[var(--accent-ink)] bg-[var(--accent-ink)] text-white shadow-[var(--shadow-elevated)]",
        // wrong selected (practice/review)
        wrong && "surface-muted border-2 border-strong",
        faded && "opacity-45",
        className,
      )}
      {...rest}
    >
      <span
        className={cn(
          "font-display inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-bold transition",
          !correct &&
            !wrong &&
            !neutralSelected &&
            "border border-default text-secondary group-hover:border-strong group-hover:text-primary",
          neutralSelected && "bg-[var(--accent-ink)] text-white",
          correct && "bg-white text-[var(--accent-ink)]",
          wrong && "border border-strong bg-white text-primary",
        )}
        aria-hidden="true"
      >
        {label}
      </span>

      <span
        className={cn(
          "flex-1 text-base leading-relaxed",
          correct ? "text-white" : "text-primary",
        )}
      >
        {text}
      </span>

      {(correct || wrong) && (
        <span
          className={cn(
            "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
            correct ? "bg-white/15 text-white" : "border border-strong text-primary",
          )}
          aria-hidden="true"
        >
          {correct ? (
            <Check className="h-4 w-4" strokeWidth={2.6} />
          ) : (
            <X className="h-4 w-4" strokeWidth={2.6} />
          )}
        </span>
      )}
    </button>
  );
};

export default OptionCard;
