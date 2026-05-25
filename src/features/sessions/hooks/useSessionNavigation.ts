import { useCallback, useState } from "react";
import type { AnswerOption } from "../types";

interface UseSessionNavigationResult {
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  selected: AnswerOption | null;
  setSelected: React.Dispatch<React.SetStateAction<AnswerOption | null>>;
  flaggedIndices: Set<number>;
  toggleFlag: (index: number) => void;
  next: (questionsCount: number) => void;
  prev: () => void;
  goTo: (index: number) => void;
}

export const useSessionNavigation = (): UseSessionNavigationResult => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<AnswerOption | null>(null);
  const [flaggedIndices, setFlaggedIndices] = useState<Set<number>>(new Set());

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

  const goTo = useCallback((index: number) => {
    setCurrentIndex(index);
    setSelected(null);
  }, []);

  const toggleFlag = useCallback((index: number) => {
    setFlaggedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  return {
    currentIndex,
    setCurrentIndex,
    selected,
    setSelected,
    flaggedIndices,
    toggleFlag,
    next,
    prev,
    goTo,
  };
};
