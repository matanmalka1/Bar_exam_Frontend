import { cn } from "../lib/cn";
import type { AnswerOption } from "../features/sessions/types";

interface ReviewOptionProps {
  label: AnswerOption;
  text: string;
  isCorrect?: boolean;
  isSelectedWrong?: boolean;
  showCorrectHint?: boolean;
  showSelectedHint?: boolean;
}

const ReviewOption = ({
  label,
  text,
  isCorrect,
  isSelectedWrong,
  showCorrectHint,
  showSelectedHint,
}: ReviewOptionProps) => (
  <div
    className={cn(
      "flex items-start gap-3 rounded-2xl border p-3 text-sm leading-6",
      isCorrect && "surface-muted border-strong text-primary",
      !isCorrect &&
        isSelectedWrong &&
        "surface border-2 border-strong text-primary",
      !isCorrect && !isSelectedWrong && "surface border-default text-primary",
    )}
  >
    <span
      className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
        isCorrect && "surface border-strong text-primary",
        !isCorrect && isSelectedWrong && "border-strong text-primary",
        !isCorrect && !isSelectedWrong && "border-default text-secondary",
      )}
    >
      {label}
    </span>
    <span className="flex-1">
      {text}
      {isCorrect && showCorrectHint && (
        <span className="mr-2 text-xs font-bold text-primary">
          (תשובה נכונה)
        </span>
      )}
      {!isCorrect && isSelectedWrong && showSelectedHint && (
        <span className="mr-2 text-xs font-bold text-primary">
          (התשובה שלך)
        </span>
      )}
    </span>
  </div>
);

export default ReviewOption;
