import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

const EmptyState = ({ title, description, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
    <h3 className="text-lg font-semibold text-[var(--accent-ink)]">{title}</h3>
    {description && <p className="text-sm text-stone-600">{description}</p>}
    {action && <div className="mt-2">{action}</div>}
  </div>
);

export default EmptyState;
