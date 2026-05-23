import { ChevronLeft, ChevronRight } from "lucide-react";

type QuestionNavigationProps = {
  currentIndex: number;
  isLast: boolean;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
};

const QuestionNavigation = ({
  currentIndex,
  isLast,
  canGoNext,
  onPrev,
  onNext,
}: QuestionNavigationProps) => (
  <div className="mt-6 flex items-center justify-between border-t border-default pt-3">
    <button
      type="button"
      onClick={onPrev}
      disabled={currentIndex === 0}
      className="focus-ring inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-secondary transition hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
    >
      <ChevronRight className="h-4 w-4" aria-hidden="true" />
      הקודמת
    </button>
    <button
      type="button"
      onClick={onNext}
      disabled={isLast || !canGoNext}
      className="focus-ring inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-secondary transition hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
    >
      הבאה
      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
    </button>
  </div>
);

export default QuestionNavigation;
