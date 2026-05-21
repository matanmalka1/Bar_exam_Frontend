import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "../lib/cn";

type AppHeaderBack =
  | {
      label?: string;
      to?: string;
      onClick?: () => void;
    }
  | false;

type AppHeaderProgress = {
  current: number;
  total: number;
  answered?: number;
};

type AppHeaderProps = {
  back?: AppHeaderBack;
  eyebrow?: string;
  title?: string;
  meta?: ReactNode;
  actions?: ReactNode;
  progress?: AppHeaderProgress;
  children?: ReactNode;
  className?: string;
  variant?: "sticky" | "inline";
};

const STICKY =
  "sticky top-0 z-20 -mx-4 -mt-4 mb-4 border-b border-default bg-[var(--paper)]/85 px-4 pt-4 pb-3 backdrop-blur supports-[backdrop-filter]:bg-[var(--paper)]/70";
const INLINE = "mb-6";

const AppHeader = ({
  back,
  eyebrow,
  title,
  meta,
  actions,
  progress,
  children,
  className,
  variant = "sticky",
}: AppHeaderProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (!back) return;
    if (back.onClick) {
      back.onClick();
    } else if (back.to) {
      navigate(back.to);
    } else {
      navigate(-1);
    }
  };

  const progressPct = progress
    ? Math.min(
        100,
        Math.max(
          0,
          ((progress.answered ?? progress.current) / Math.max(progress.total, 1)) * 100,
        ),
      )
    : 0;

  return (
    <header
      className={cn(variant === "inline" ? INLINE : STICKY, className)}
    >
      <div className="flex items-center justify-between gap-2">
        {back !== false && back ? (
          <button
            type="button"
            onClick={handleBack}
            className="focus-ring -mr-2 inline-flex items-center gap-1 rounded-xl px-2 py-1.5 text-sm font-medium text-secondary transition hover:text-primary active:scale-95"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
            {back.label ?? "חזרה"}
          </button>
        ) : (
          <div />
        )}

        {eyebrow && (
          <p className="font-display text-[11px] tracking-[0.22em] text-secondary">
            {eyebrow}
          </p>
        )}

        {actions && <div className="flex items-center gap-1">{actions}</div>}
      </div>

      {(title || meta) && (
        <div className="mt-2 flex items-end justify-between gap-3">
          {title && (
            <p className="font-display text-lg font-bold text-primary">{title}</p>
          )}
          {meta && <div>{meta}</div>}
        </div>
      )}

      {progress && (
        <>
          <div className="mt-2 flex items-end justify-between gap-3">
            <p className="font-display flex items-baseline gap-1.5 tabular-nums">
              <span className="text-[2rem] font-black leading-none text-[var(--accent-ink)]">
                {String(progress.current).padStart(2, "0")}
              </span>
              <span className="text-base font-medium text-secondary">
                / {String(progress.total).padStart(2, "0")}
              </span>
            </p>
            {progress.answered !== undefined && (
              <span className="text-[11px] uppercase tracking-[0.18em] text-secondary tabular-nums">
                נענו {progress.answered}/{progress.total}
              </span>
            )}
          </div>
          <div className="mt-2 h-[3px] w-full overflow-hidden rounded-full bg-black/10">
            <div
              className="h-full rounded-full bg-[var(--accent-ink)] transition-all duration-500 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </>
      )}

      {children}
    </header>
  );
};

export default AppHeader;
