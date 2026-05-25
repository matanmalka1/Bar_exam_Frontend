import { useCallback, useState } from "react";
import type { AnswerOption } from "../types";

interface UseSessionNavigationResult {
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  selected: AnswerOption | null;
  setSelected: React.Dispatch<React.SetStateAction<AnswerOption | null>>;
  next: (questionsCount: number) => void;
  prev: () => void;
}

export const useSessionNavigation = (): UseSessionNavigationResult => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<AnswerOption | null>(null);

  const next = useCallback(
    (questionsCount: number) => {
      if (currentIndex >= questionsCount - 1) return;
      setCurrentIndex((i) => i + 1);
      setSelected(null);
    },
    [currentIndex],
  );

  const prev = useCallback(() => {
    if (currentIndex <= 0) return;
    setCurrentIndex((i) => i - 1);
    setSelected(null);
  }, [currentIndex]);

  return { currentIndex, setCurrentIndex, selected, setSelected, next, prev };
};
