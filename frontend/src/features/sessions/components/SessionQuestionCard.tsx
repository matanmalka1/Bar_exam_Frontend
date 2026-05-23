import type { SessionQuestion } from "../types";

type SessionQuestionCardProps = {
  question: SessionQuestion;
  isBookmarked: boolean;
};

const SessionQuestionCard = ({
  question,
  isBookmarked,
}: SessionQuestionCardProps) => (
  <article className="rounded-3xl border border-default bg-[var(--surface-muted)] p-5 shadow-[var(--shadow-default)]">
    <div className="flex items-baseline justify-between gap-2 border-b border-black/10 pb-3">
      <div className="flex items-baseline gap-2">
        <span className="font-display text-[10px] uppercase tracking-[0.22em] text-secondary">
          שאלה
        </span>
        <span className="font-display text-xs font-bold tabular-nums text-[var(--accent-ink)]">
          #{question.number}
        </span>
      </div>
      {isBookmarked && (
        <span className="font-display text-[10px] uppercase tracking-[0.22em] text-secondary">
          שמורה
        </span>
      )}
    </div>
    <p className="mt-4 whitespace-pre-wrap text-[17px] leading-[1.85] text-primary">
      {question.body}
    </p>
  </article>
);

export default SessionQuestionCard;
