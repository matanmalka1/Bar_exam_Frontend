import type { HTMLAttributes } from "react";
import { cn } from "../lib/cn";

const Card = ({ className, ...rest }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "surface rounded-2xl border border-default p-4 shadow-[var(--shadow-default)]",
      className,
    )}
    {...rest}
  />
);

export default Card;
