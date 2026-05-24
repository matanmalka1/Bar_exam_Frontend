import type { SessionQuestion } from "../types";

const HEBREW_MONTHS: Record<string, string> = {
  "01": "ינואר", "02": "פברואר", "03": "מרץ", "04": "אפריל",
  "05": "מאי", "06": "יוני", "07": "יולי", "08": "אוגוסט",
  "09": "ספטמבר", "10": "אוקטובר", "11": "נובמבר", "12": "דצמבר",
};

const PART_LABEL: Record<string, string> = { B: "דין דיוני", C: "דין מהותי" };

const parseStableId = (stableId: string): { date: string; part: string } | null => {
  const m = stableId.match(/^(\d{4})-(0[1-9]|1[0-2])_([BC])_/);
  if (!m) return null;
  const month = HEBREW_MONTHS[m[2]] ?? m[2];
  return { date: `${month} ${m[1]}`, part: PART_LABEL[m[3]] ?? m[3] };
};

type SessionQuestionCardProps = {
  question: SessionQuestion;
  isBookmarked: boolean;
};

const SessionQuestionCard = ({
  question,
  isBookmarked,
}: SessionQuestionCardProps) => {
  const meta = parseStableId(question.stable_id);
  return (
    <article className="rounded-3xl border border-default bg-[var(--surface-muted)] p-5 shadow-[var(--shadow-default)]">
      <div className="flex items-baseline justify-between gap-2 border-b border-black/10 pb-3">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-[10px] uppercase tracking-[0.22em] text-secondary">
            שאלה
          </span>
          <span className="font-display text-xs font-bold tabular-nums text-[var(--accent-ink)]">
            #{question.number}
          </span>
          {meta && (
            <span className="font-display text-[10px] tracking-[0.12em] text-secondary">
              · {meta.part} · {meta.date}
            </span>
          )}
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
};

export default SessionQuestionCard;
