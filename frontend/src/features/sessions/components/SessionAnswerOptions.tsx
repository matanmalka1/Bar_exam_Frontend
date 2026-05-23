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
}: SessionAnswerOptionsProps) => (
  <div className="mt-4 grid gap-2.5">
    {OPTIONS.map((option) => {
      const submittedPracticeAnswer = practiceAnswer ?? null;
      const selected = currentAnswer
        ? currentAnswer.selected_answer === option
        : displaySelected === option;
      const showCorrectness = mode === "practice" && answerSubmitted;
      const isCorrect =
        showCorrectness && correctAnswer !== null && option === correctAnswer;
      const isWrong =
        showCorrectness &&
        submittedPracticeAnswer !== null &&
        submittedPracticeAnswer.is_correct === false &&
        option === submittedPracticeAnswer.selected_answer;

      return (
        <OptionCard
          key={option}
          mode={mode}
          label={option}
          text={question.options[option]}
          selected={selected}
          isCorrect={isCorrect}
          isWrong={isWrong}
          disabled={disabled}
          onClick={() => onSelect(option)}
        />
      );
    })}
  </div>
);

export default SessionAnswerOptions;
