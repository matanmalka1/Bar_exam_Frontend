import type { ReactNode } from "react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  action?: ReactNode;
}

const ErrorState = ({ title = "שגיאה", message, action }: ErrorStateProps) => (
  <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
    <h3 className="text-lg font-bold text-primary">{title}</h3>
    {message && <p className="text-sm text-secondary">{message}</p>}
    {action && <div className="mt-2">{action}</div>}
  </div>
);

export default ErrorState;
