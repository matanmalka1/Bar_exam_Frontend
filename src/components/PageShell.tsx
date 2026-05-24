import type { ReactNode } from "react";
import { cn } from "../lib/cn";

const PageShell = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={cn("mx-auto w-full max-w-3xl px-4 pt-5 sm:px-6", className)}
  >
    {children}
  </div>
);

export default PageShell;
