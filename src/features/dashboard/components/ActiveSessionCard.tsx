import { ArrowLeft, Play } from "lucide-react";
import type { SessionSummary } from "../../sessions/types";
import { sessionModeLabel } from "../dashboardFormat";

type ActiveSessionCardProps = {
  session: SessionSummary;
  onResume: () => void;
};

const ActiveSessionCard = ({ session, onResume }: ActiveSessionCardProps) => {
  const progress =
    session.total_questions > 0
      ? (session.answered_count / session.total_questions) * 100
      : 0;

  return (
    <button
      type="button"
      onClick={onResume}
      className="focus-ring group mt-7 block w-full overflow-hidden rounded-2xl bg-[var(--accent-ink)] p-4 text-right text-white shadow-[var(--shadow-elevated)] transition active:scale-[0.99]"
    >
      <div className="flex items-center gap-4">
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25 transition group-hover:bg-white/25">
          <Play className="h-5 w-5" fill="currentColor" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.22em] text-white/70">
            המשך תרגול פעיל
          </p>
          <p className="font-display mt-0.5 truncate text-lg font-bold leading-tight">
            {sessionModeLabel(session)}
          </p>
          <p className="mt-1 text-xs tabular-nums text-white/70">
            {session.answered_count}/{session.total_questions} שאלות
          </p>
        </div>
        <ArrowLeft
          className="h-5 w-5 shrink-0 text-white/70 transition group-hover:-translate-x-1 group-hover:text-white"
          aria-hidden="true"
        />
      </div>
      <div className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-white/15">
        <div
          className="h-full rounded-full bg-white transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </button>
  );
};

export default ActiveSessionCard;
