import type { AnswerOption } from "../features/sessions/types";
import OptionCard from "./OptionCard";
import ReferenceBox from "./ReferenceBox";

const OPTIONS: AnswerOption[] = ["א", "ב", "ג", "ד"];

interface AnswerPanelProps {
  id: string;
  options: Record<AnswerOption, string>;
  correctAnswer: AnswerOption | null | undefined;
  reference?: string | null;
}

const AnswerPanel = ({ id, options, correctAnswer, reference }: AnswerPanelProps) => (
  <div id={id} className="space-y-3">
    <div className="grid gap-2">
      {OPTIONS.map((opt) => (
        <OptionCard
          key={opt}
          mode="review"
          label={opt}
          text={options[opt]}
          isCorrect={correctAnswer === opt}
          showCorrectBadge
        />
      ))}
    </div>
    {reference && <ReferenceBox reference={reference} />}
  </div>
);

export default AnswerPanel;
