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
      isCorrect && "border-green-600 bg-green-50 text-green-900",
      !isCorrect &&
        isSelectedWrong &&
        "border-red-600 bg-red-50 text-red-900",
      !isCorrect &&
        !isSelectedWrong &&
        "border-[#dccfbb] bg-white/85 text-stone-800",
    )}
  >
    <span
      className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
        isCorrect && "border-green-600 text-green-700",
        !isCorrect && isSelectedWrong && "border-red-600 text-red-700",
        !isCorrect && !isSelectedWrong && "border-[#d6c8b4] text-stone-600",
      )}
    >
      {label}
    </span>
    <span className="flex-1">
      {text}
      {isCorrect && showCorrectHint && (
        <span className="mr-2 text-xs font-medium text-green-700">
          (תשובה נכונה)
        </span>
      )}
      {!isCorrect && isSelectedWrong && showSelectedHint && (
        <span className="mr-2 text-xs font-medium text-red-700">
          (התשובה שלך)
        </span>
      )}
    </span>
  </div>
);

export default ReviewOption;
