import type { ComponentType } from "react";
import { ArrowLeft } from "lucide-react";
import AppLoader from "../../../components/loader";

type RouteRowProps = {
  index: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  hint: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
};

const RouteRow = ({
  index,
  icon: Icon,
  title,
  hint,
  onClick,
  disabled,
  loading,
}: RouteRowProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="focus-ring group flex w-full items-center gap-4 py-4 text-right transition disabled:cursor-not-allowed disabled:opacity-45"
  >
    <span className="font-display w-7 shrink-0 text-xs tabular-nums text-secondary opacity-60">
      {index}
    </span>
    <span className="surface inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-default transition group-hover:border-strong group-active:scale-95">
      <Icon className="h-5 w-5" strokeWidth={1.8} />
    </span>
    <span className="min-w-0 flex-1">
      <span className="font-display block text-lg font-bold leading-tight text-[var(--accent-ink)]">
        {title}
      </span>
      <span className="mt-0.5 block truncate text-sm text-secondary">
        {loading ? <AppLoader variant="inline" label="מתחיל..." /> : hint}
      </span>
    </span>
    <ArrowLeft
      className="h-5 w-5 shrink-0 text-secondary transition group-hover:-translate-x-1 group-hover:text-primary"
      aria-hidden="true"
    />
  </button>
);

export default RouteRow;
