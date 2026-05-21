import { cn } from "../lib/cn";

const PART_LABEL: Record<string, string> = {
  B: "דין דיוני",
  C: "דין מהותי",
};

type QuestionMetaProps = {
  number?: number | string;
  examDate?: string | null;
  part?: "B" | "C" | string | null;
  wrongCount?: number | null;
  totalAnswered?: number | null;
  className?: string;
};

const QuestionMeta = ({
  number,
  examDate,
  part,
  wrongCount,
  totalAnswered,
  className,
}: QuestionMetaProps) => {
  const segments: string[] = [];

  if (number != null) segments.push(`שאלה ${number}`);
  if (examDate) segments.push(examDate);
  if (part) segments.push(PART_LABEL[part] ?? `חלק ${part}`);
  if (wrongCount != null && totalAnswered != null) {
    segments.push(`${wrongCount}/${totalAnswered} טעויות`);
  }

  if (segments.length === 0) return null;

  return (
    <p className={cn("text-xs tabular-nums text-secondary", className)}>
      {segments.join(" · ")}
    </p>
  );
};

export default QuestionMeta;
