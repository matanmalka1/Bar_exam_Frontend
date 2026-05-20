import type { HTMLAttributes } from "react";
import { cn } from "../lib/cn";

const Card = ({ className, ...rest }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "rounded-2xl border border-gray-200 bg-white p-4 shadow-sm",
      className,
    )}
    {...rest}
  />
);

export default Card;
