import type { ButtonHTMLAttributes } from "react";
import { Check, X } from "lucide-react";
import { cn } from "../lib/cn";

export type OptionMode = "practice" | "exam" | "review";

interface OptionCardProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  mode?: OptionMode;
  label: string;
  text: string;
  selected?: boolean;
  isCorrect?: boolean;
  isWrong?: boolean;
  showCorrectBadge?: boolean;
  showSelectedBadge?: boolean;
}

const OptionCard = ({
  mode = "practice",
  label,
  text,
  selected,
  isCorrect,
  isWrong,
  showCorrectBadge,
  showSelectedBadge,
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
  const isReview = mode === "review";

  const showBadge = isReview && (correct || wrong) && (showCorrectBadge || showSelectedBadge);

  return (
    <button
      type={type}
      disabled={disabled || isReview}
      aria-pressed={selected}
      className={cn(
        "focus-ring group relative flex w-full items-start gap-3 rounded-2xl border p-4 text-right transition disabled:cursor-default",
        showBadge && "pt-7",
        // unselected, no result
        !correct &&
          !wrong &&
          !neutralSelected &&
          !isReview &&
          "surface border-default hover:border-strong hover:bg-[var(--surface-muted)] active:scale-[0.99]",
        // review non-interactive unselected
        isReview && !correct && !wrong && !neutralSelected && "surface border-default",
        // selected, no result yet
        neutralSelected && "surface-muted border-strong shadow-[var(--shadow-default)]",
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
      {showBadge && (
        <span
          className={cn(
            "absolute start-4 top-2 text-[10px] font-bold uppercase tracking-widest",
            correct ? "text-white/70" : "text-secondary",
          )}
        >
          {correct && showCorrectBadge ? "תשובה נכונה" : null}
          {wrong && showSelectedBadge ? "התשובה שלך" : null}
        </span>
      )}

      <span
        className={cn(
          "font-display inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-bold transition",
          !correct &&
            !wrong &&
            !neutralSelected &&
            !isReview &&
            "border border-default text-secondary group-hover:border-strong group-hover:text-primary",
          isReview &&
            !correct &&
            !wrong &&
            !neutralSelected &&
            "border border-default text-secondary",
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
