import { useCallback, useMemo, useState } from "react";
import OptionCard from "../../../components/OptionCard";
import type {
  AnswerOption,
  SessionAnswerInline,
  SessionQuestion,
} from "../types";

const OPTIONS: AnswerOption[] = ["א", "ב", "ג", "ד"];

type SessionAnswerOptionsProps = {
  question: SessionQuestion;
  mode: "practice" | "exam";
  disabled: boolean;
  displaySelected: AnswerOption | null;
  answerSubmitted: boolean;
  currentAnswer?: SessionAnswerInline | null;
  practiceAnswer?: {
    selected_answer: AnswerOption;
    is_correct: boolean;
  } | null;
  correctAnswer?: AnswerOption | null;
  onSelect: (option: AnswerOption) => void;
};

const SessionAnswerOptions = ({
  question,
  mode,
  disabled,
  displaySelected,
  answerSubmitted,
  currentAnswer,
  practiceAnswer,
  correctAnswer = null,
  onSelect,
}: SessionAnswerOptionsProps) => {
  const questionId = question.stable_id;
  const selectedAnswer = currentAnswer?.selected_answer ?? displaySelected;
  const submittedPracticeAnswer = practiceAnswer ?? null;
  const showCorrectness = mode === "practice" && answerSubmitted;
  const [eliminatedByQuestion, setEliminatedByQuestion] = useState<
    Record<string, AnswerOption[]>
  >({});

  const eliminatedOptions = useMemo(
    () => new Set(eliminatedByQuestion[questionId] ?? []),
    [eliminatedByQuestion, questionId],
  );

  const toggleEliminated = useCallback(
    (option: AnswerOption) => {
      setEliminatedByQuestion((current) => {
        const next = new Set(current[questionId] ?? []);

        if (next.has(option)) {
          next.delete(option);
        } else {
          next.add(option);
        }

        return {
          ...current,
          [questionId]: Array.from(next),
        };
      });
    },
    [questionId],
  );

  const restoreIfEliminated = useCallback(
    (option: AnswerOption) => {
      if (eliminatedOptions.has(option)) {
        toggleEliminated(option);
      }
    },
    [eliminatedOptions, toggleEliminated],
  );

  const selectOption = useCallback(
    (option: AnswerOption) => {
      restoreIfEliminated(option);
      onSelect(option);
    },
    [onSelect, restoreIfEliminated],
  );

  return (
    <div className="mt-4 grid gap-2.5">
      {OPTIONS.map((option) => {
        const selected = selectedAnswer === option;
        const isCorrect =
          showCorrectness && correctAnswer !== null && option === correctAnswer;
        const isWrong =
          showCorrectness &&
          submittedPracticeAnswer?.is_correct === false &&
          option === submittedPracticeAnswer.selected_answer;

        return (
          <OptionCard
            key={option}
            mode={mode}
            label={option}
            text={question.options[option]}
            selected={selected}
            eliminated={eliminatedOptions.has(option)}
            isCorrect={isCorrect}
            isWrong={isWrong}
            disabled={disabled}
            onClick={(event) => {
              selectOption(option);
              if (selected) {
                event.currentTarget.blur();
              }
            }}
            onToggleEliminated={() => toggleEliminated(option)}
          />
        );
      })}
    </div>
  );
};

export default SessionAnswerOptions;
